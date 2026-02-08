// src/routes/stripe.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const sql = require('../config/database');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.post('/confirm-payment', async (req, res) => {
    const { paymentIntentId, paymentMethodId } = req.body;

    try {
        // Primeiro recuperamos o estado atual do intent
        let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log(`[Stripe] PI ${paymentIntentId} status: ${paymentIntent.status}`);

        // Se já estiver em um estado avançado (especialmente para boleto que fica em 'requires_action')
        // a gente não tenta confirmar de novo para evitar erro da Stripe
        const statusesToSkipConfirm = ['requires_action', 'succeeded', 'processing', 'requires_capture'];

        if (!statusesToSkipConfirm.includes(paymentIntent.status)) {
            paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });
        }

        res.json({ paymentIntent });
    } catch (error) {
        console.error('❌ Erro ao confirmar pagamento:', error.message);
        res.status(500).json({ error: error.message });
    }
});

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

// Atualiza metadados do PaymentIntent para vincular ao Pedido
router.post('/update-payment-intent', async (req, res) => {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
        return res.status(400).json({ error: 'paymentIntentId e orderId são obrigatórios' });
    }

    try {
        await stripe.paymentIntents.update(paymentIntentId, {
            metadata: { orderId }
        });
        console.log(`✅ PaymentIntent ${paymentIntentId} vinculado ao pedido ${orderId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Erro ao atualizar metadata:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Limpeza via Supabase Client (HTTPS) para evitar bloqueio de porta do Postgres
router.post('/cleanup-orders', async (req, res) => {
    try {
        console.log('🔍 Executando limpeza de pedidos antigos (via Supabase Client)...');

        // 3 dias atrás
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 3);

        const { data: result, error } = await supabase
            .from('pedidos')
            .update({ status: 'cancelado' })
            .eq('status', 'pendente')
            .lt('created_at', dateLimit.toISOString())
            .select('id');

        if (error) {
            throw error;
        }

        console.log(`✅ Limpeza concluída: ${result ? result.length : 0} pedidos cancelados.`);
        res.json({ success: true, count: result ? result.length : 0, canceledIds: result ? result.map(r => r.id) : [] });
    } catch (error) {
        console.error('❌ Erro na limpeza de pedidos:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
