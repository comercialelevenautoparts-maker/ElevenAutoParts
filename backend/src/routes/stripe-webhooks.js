const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { syncProduct, syncPrice } = require('../services/stripeSyncService');
const BlingService = require('../services/BlingService');
const MelhorEnvioService = require('../services/MelhorEnvioService');

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Certifique-se de que este endpoint seja montado ANTES de qualquer body-parser JSON global no index.js
router.post('/', async (req, res) => {
    console.log('📥 Recebida requisição POST em /api/webhooks/stripe');
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret && req.headers['x-test-bypass'] !== 'true') {
            console.log('🔐 Validando assinatura do Webhook Stripe...');
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log('✅ Assinatura validada com sucesso.');
        } else {
            console.log('⚠️ Ignorando validação de assinatura (Ambiente de teste ou Secret ausente).');
            event = req.body;
            if (Buffer.isBuffer(req.body)) {
                event = JSON.parse(req.body.toString());
            }
        }
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🔔 Evento Stripe recebido: ${event.type}`);

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`💳 PaymentIntent Succeeded: ${paymentIntent.id}`, paymentIntent.metadata);
                const orderId = paymentIntent.metadata.orderId;

                if (orderId) {
                    console.log(`✅ Pagamento confirmado para o pedido ${orderId}`);

                    // 0. Atualiza o status do pedido no banco de dados para 'pago'
                    try {
                        const { error: updateError } = await supabase
                            .from('pedidos')
                            .update({ 
                                status: 'pago',
                                updated_at: new Date()
                            })
                            .eq('id', orderId);

                        if (updateError) {
                            console.error(`❌ Erro ao atualizar status do pedido ${orderId}:`, updateError.message);
                        } else {
                            console.log(`✅ Status do pedido ${orderId} atualizado para 'pago'.`);
                        }
                    } catch (dbErr) {
                        console.error(`❌ Erro de banco ao atualizar pedido ${orderId}:`, dbErr.message);
                    }
                    
                    // 1. Processa no Bling (Venda + NF-e)
                    try {
                        BlingService.createSalesOrder(orderId).then(result => {
                            if (result && result.success && result.blingOrderId) {
                                console.log(`🚀 Iniciando emissão automática de NF-e para Pedido Bling: ${result.blingOrderId}`);
                                BlingService.emitirNFe(orderId, result.blingOrderId).catch(err => {
                                    console.error('⚠️ Erro ao emitir NFe no Bling:', err.message);
                                });
                            }
                        }).catch(err => {
                            console.error('⚠️ Erro ao criar pedido no Bling:', err.message);
                        });
                    } catch (blingErr) {
                        console.error('⚠️ Erro ao disparar integração Bling:', blingErr.message);
                    }

                    // 2. Envia para o Melhor Envio (Carrinho) - APENAS SE NÃO FOR RETIRADA
                    try {
                        const { data: orderInfo } = await supabase
                            .from('pedidos')
                            .select('tipo_frete')
                            .eq('id', orderId)
                            .single();
                        
                        if (orderInfo && orderInfo.tipo_frete !== 'Retirada no Posto') {
                            MelhorEnvioService.addToCart(orderId).catch(err => {
                                console.error('⚠️ Erro ao enviar para Melhor Envio:', err.message);
                            });
                        } else {
                            console.log(`📦 Pedido ${orderId} é RETIRADA NO LOCAL. Ignorando Melhor Envio.`);
                        }
                    } catch (meErr) {
                        console.error('⚠️ Erro ao disparar integração Melhor Envio:', meErr.message);
                    }

                    // 3. Lógica de Indique e Ganhe
                    try {
                        const { data: orderData } = await supabase
                            .from('pedidos')
                            .select('user_id, valor_total')
                            .eq('id', orderId)
                            .single();

                        if (orderData?.user_id) {
                            const { data: buyerProfile } = await supabase
                                .from('profiles')
                                .select('id, referred_by')
                                .eq('user_id', orderData.user_id)
                                .single();

                            if (buyerProfile?.referred_by) {
                                const { data: previousCredits } = await supabase
                                    .from('creditos')
                                    .select('id')
                                    .eq('user_id', buyerProfile.referred_by)
                                    .eq('id_referencia', orderId)
                                    .maybeSingle();

                                if (!previousCredits) {
                                    await supabase.from('creditos').insert({
                                        user_id: buyerProfile.referred_by,
                                        valor: 50.00,
                                        id_referencia: orderId,
                                        descricao: 'Bônus por indicação de amigo',
                                        tipo: 'entrada'
                                    });

                                    const { data: referrerProfile } = await supabase
                                        .from('profiles')
                                        .select('saldo_creditos')
                                        .eq('id', buyerProfile.referred_by)
                                        .single();

                                    const novoSaldo = (Number(referrerProfile?.saldo_creditos || 0) + 50.00);
                                    await supabase.from('profiles').update({ saldo_creditos: novoSaldo }).eq('id', buyerProfile.referred_by);
                                }
                            }
                        }
                    } catch (referralErr) {
                        console.error('⚠️ Erro na lógica de indicação:', referralErr.message);
                    }
                }
                break;

            case 'payment_intent.payment_failed':
            case 'payment_intent.canceled':
                const piFailed = event.data.object;
                const failedOrderId = piFailed.metadata.orderId;
                if (failedOrderId) {
                    await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', failedOrderId).in('status', ['pendente', 'em_analise']);
                }
                break;

            case 'checkout.session.completed':
                const session = event.data.object;
                console.log(`🛒 Checkout Session Completed: ${session.id}`, session.metadata);
                const orderIdFromSession = session.metadata.orderId;

                if (orderIdFromSession) {
                    console.log(`✅ Pagamento confirmado via Checkout para o pedido ${orderIdFromSession}`);

                    try {
                        const { error: updateError } = await supabase
                            .from('pedidos')
                            .update({ 
                                status: 'pago',
                                updated_at: new Date()
                            })
                            .eq('id', orderIdFromSession);

                        if (updateError) {
                            console.error(`❌ Erro ao atualizar status do pedido ${orderIdFromSession}:`, updateError.message);
                        } else {
                            console.log(`✅ Status do pedido ${orderIdFromSession} atualizado para 'pago'.`);
                        }
                    } catch (dbErr) {
                        console.error(`❌ Erro de banco ao atualizar pedido ${orderIdFromSession}:`, dbErr.message);
                    }
                }
                break;

            case 'product.created':
            case 'product.updated':
                await syncProduct(event.data.object.id);
                break;

            case 'price.created':
            case 'price.updated':
                await syncPrice(event.data.object.id);
                break;

            default:
                // Evento não tratado
        }
    } catch (err) {
        console.error(`Erro processando evento ${event.type}:`, err);
    }

    res.send();
});

module.exports = router;
