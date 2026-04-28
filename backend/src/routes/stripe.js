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
    console.log('📥 Corpo recebido em /confirm-payment:', JSON.stringify(req.body));
    const { paymentIntentId, paymentMethodId, orderId } = req.body;

    try {
        // Primeiro recuperamos o estado atual do intent
        let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log(`[Stripe] PI ${paymentIntentId} status: ${paymentIntent.status}`);

        // Se já estiver em um estado avançado (especialmente para boleto que fica em 'requires_action')

        const statusesToSkipConfirm = ['requires_action', 'succeeded', 'processing', 'requires_capture'];

        if (!statusesToSkipConfirm.includes(paymentIntent.status)) {
            if (orderId) {
                await stripe.paymentIntents.update(paymentIntentId, {
                    metadata: { orderId }
                });
            }

            paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });
        } else if (orderId) {
            paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
                metadata: { orderId }
            });
        }

        res.json({ paymentIntent });
    } catch (error) {
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

        const paymentIntent = await stripe.paymentIntents.create({
            amount: cleanAmount,
            currency,
            metadata: metadata || {},
            receipt_email: customerEmail,
            payment_method_types: ['card', 'boleto'],
            payment_method_options: {
                card: {
                    installments: {
                        enabled: true,
                    },
                },
                boleto: { expires_after_days: 3 },
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
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

// Atualiza metadados ou valor do PaymentIntent
router.post('/update-payment-intent', async (req, res) => {
    const { paymentIntentId, orderId, amount, currency = 'brl' } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({ error: 'paymentIntentId é obrigatório' });
    }

    try {
        // 1. Verificar o status atual do PaymentIntent
        const currentPI = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Se já foi pago, não podemos atualizar o valor
        if (currentPI.status === 'succeeded') {
            return res.json({ 
                success: true, 
                message: 'Pagamento já concluído, atualização ignorada.',
                paymentIntent: currentPI 
            });
        }

        const updateData = {};
        if (orderId) updateData.metadata = { orderId };
        if (amount) {
            updateData.amount = Math.round(Number(amount).toFixed(2) * 100);
            updateData.currency = currency;
        }

        const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, updateData);
        
        console.log(`✅ PaymentIntent ${paymentIntentId} atualizado. Novo valor: ${paymentIntent.amount / 100}`);
        res.json({ success: true, paymentIntent });
    } catch (error) {
        // Silenciar erro se o PI já estiver concluído (corrida de processos)
        if (error.message.includes('status of succeeded')) {
            return res.json({ success: true, message: 'Já processado.' });
        }
        console.error('❌ Erro ao atualizar PaymentIntent:', error.message);
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
