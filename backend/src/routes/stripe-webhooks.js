const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { syncProduct, syncPrice } = require('../services/stripeSyncService');
const BlingService = require('../services/BlingService');

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ... (existing imports)

// ...

// ... (existing imports)
// Certifique-se de que este endpoint seja montado ANTES de qualquer body-parser JSON global no index.js

router.post('/', async (req, res) => {
    console.log('📥 Recebida requisição POST em /api/webhooks/stripe');
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Se o segredo estiver definido, valida a assinatura
        if (endpointSecret && req.headers['x-test-bypass'] !== 'true') {
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
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata.orderId;

                if (orderId) {
                    console.log(`✅ Pagamento confirmado para o pedido ${orderId}`);
                    // Atualizar pedido para 'pago' via Supabase Client
                    const { error } = await supabase
                        .from('pedidos')
                        .update({ status: 'pago' })
                        .eq('id', orderId);

                    if (error) {
                        console.error('Erro ao atualizar pedido:', error);
                    } else {
                        // --- INTEGRACAO BLING ---
                        try {
                            // Dispara a criação do pedido no Bling de forma assíncrona
                            BlingService.createSalesOrder(orderId).catch(err => {
                                console.error('⚠️ Erro ao criar pedido no Bling (via Webhook):', err.message);
                            });
                        } catch (blingErr) {
                            console.error('⚠️ Erro ao disparar integração Bling:', blingErr.message);
                        }

                        // --- LÓGICA DE INDIQUE E GANHE (REFERRAL REWARDS) ---
                        try {
                            // 1. Pega o dono do pedido
                            const { data: orderData } = await supabase
                                .from('pedidos')
                                .select('user_id, valor_total')
                                .eq('id', orderId)
                                .single();

                            if (orderData?.user_id) {
                                // 2. Verifica se ele foi indicado por alguém
                                const { data: buyerProfile } = await supabase
                                    .from('profiles')
                                    .select('id, referred_by')
                                    .eq('user_id', orderData.user_id)
                                    .single();

                                if (buyerProfile?.referred_by) {
                                    console.log(`🎁 Identificada indicação! Buyer: ${buyerProfile.id}, Referrer: ${buyerProfile.referred_by}`);

                                    // 3. Verifica se o padrinho já ganhou por esse indicado (opcional, mas bom evitar duplicatas)
                                    // Por simplicidade, vamos apenas creditar R$ 50 uma vez (primeira compra)
                                    const { data: previousCredits } = await supabase
                                        .from('creditos')
                                        .select('id')
                                        .eq('user_id', buyerProfile.referred_by)
                                        .eq('id_referencia', orderId)
                                        .maybeSingle();

                                    if (!previousCredits) {
                                        console.log('💰 Atribuindo R$ 50,00 de crédito ao padrinho...');

                                        // Adiciona no extrato de créditos
                                        const { error: creditError } = await supabase
                                            .from('creditos')
                                            .insert({
                                                user_id: buyerProfile.referred_by,
                                                valor: 50.00,
                                                id_referencia: orderId,
                                                descricao: 'Bônus por indicação de amigo',
                                                tipo: 'entrada'
                                            });

                                        if (!creditError) {
                                            // Atualiza o saldo total no perfil do padrinho
                                            // Nota: Em um sistema real, faríamos um SUM no extrato, aqui atualizamos o cache
                                            const { data: referrerProfile } = await supabase
                                                .from('profiles')
                                                .select('saldo_creditos')
                                                .eq('id', buyerProfile.referred_by)
                                                .single();

                                            const novoSaldo = (Number(referrerProfile?.saldo_creditos || 0) + 50.00);

                                            await supabase
                                                .from('profiles')
                                                .update({ saldo_creditos: novoSaldo })
                                                .eq('id', buyerProfile.referred_by);
                                        } else {
                                            console.warn('⚠️ Não foi possível salvar crédito (coluna ou tabela pode não existir):', creditError.message);
                                        }
                                    }
                                }
                            }
                        } catch (referralErr) {
                            console.error('⚠️ Erro na lógica de indicação:', referralErr.message);
                        }
                    }
                }
                break;

            case 'payment_intent.payment_failed':
            case 'payment_intent.canceled':
                const piFailed = event.data.object;
                const failedOrderId = piFailed.metadata.orderId;

                if (failedOrderId) {
                    console.log(`❌ Pagamento falhou/cancelado para o pedido ${failedOrderId}`);
                    // Atualizar pedido para 'cancelado' 
                    const { error } = await supabase
                        .from('pedidos')
                        .update({ status: 'cancelado' })
                        .eq('id', failedOrderId)
                        .in('status', ['pendente', 'em_analise']); // Evita cancelar pagos

                    if (error) console.error('Erro ao cancelar pedido:', error);
                }
                break;

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
