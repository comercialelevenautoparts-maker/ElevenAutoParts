const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { syncProduct, syncPrice } = require('../services/stripeSyncService');

// Nota: A validação de assinatura requer o corpo RAW da requisição.
// Certifique-se de que este endpoint seja montado ANTES de qualquer body-parser JSON global no index.js

router.post('/', async (req, res) => {
    console.log('📥 Recebida requisição POST em /api/webhooks/stripe');
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Se o segredo estiver definido, valida a assinatura
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // Fallback para dev local sem validação (CUIDADO: INSEGURO PARA PROD)
            // Se não houver segredo, assume-se que req.body já é o objeto JSON parsed
            // Isso requer que o express.json() tenha rodado antes APENAS se não estivermos validando
            // Se estivermos validando, req.body TEM QUE SER BUFFER/STRING
            event = req.body;

            // Se req.body for Buffer, tentamos parsear
            if (Buffer.isBuffer(req.body)) {
                event = JSON.parse(req.body.toString());
            }
        }
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    console.log(`🔔 Evento Stripe recebido: ${event.type}`);

    try {
        switch (event.type) {
            case 'product.created':
            case 'product.updated':
                const product = event.data.object;
                await syncProduct(product.id);
                break;

            case 'price.created':
            case 'price.updated':
                const price = event.data.object;
                await syncPrice(price.id);
                break;

            case 'product.deleted':
                // Opcional: lidar com deleção
                console.log('🗑️ Produto deletado na Stripe:', event.data.object.id);
                break;

            default:
            // Evento não tratado
            // console.log(`Evento não tratado: ${event.type}`);
        }
    } catch (err) {
        console.error(`Erro processando evento ${event.type}:`, err);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});

module.exports = router;
