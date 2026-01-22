// src/routes/stripe.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.post('/create-payment-intent', async (req, res) => {
    const { amount, currency = 'brl', metadata, customerEmail } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount é obrigatório' });
    }

    try {
        const cleanAmount = Math.round(Number(amount).toFixed(2) * 100);

        // Criamos o intent com suporte a parcelamento (installments) para cartões brasileiros
        const paymentIntent = await stripe.paymentIntents.create({
            amount: cleanAmount,
            currency,
            metadata: metadata || {},
            receipt_email: customerEmail,
            payment_method_types: ['card', 'boleto'],
            payment_method_options: {
                card: {
                    installments: {
                        enabled: true, // Habilita o suporte a parcelas no motor da Stripe
                    },
                },
                boleto: { expires_after_days: 3 },
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('❌ Erro Stripe:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/create-checkout-session', async (req, res) => {
    const { priceId, quantity = 1, successUrl, cancelUrl, customerEmail, metadata } = req.body;
    if (!priceId) return res.status(400).json({ error: 'priceId é obrigatório' });

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [{ price: priceId, quantity }],
            success_url: successUrl || `${req.headers.origin}/checkout/success`,
            cancel_url: cancelUrl || `${req.headers.origin}/checkout/cancel`,
            customer_email: customerEmail,
            metadata: metadata || {},
        });
        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
