require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const REFERRER_ID = 'd18fa0ba-aacc-478e-a28e-d741bf5f207c';
const FRIEND_ID = '1de9b5ed-a682-4b4e-8d6d-86a30886e784';

async function testReferralFlow() {
    console.log('🚀 Iniciando teste do fluxo de indicação...');

    // 1. Vincular o Amigo ao Padrinho
    console.log('\nStep 1: Vinculando Amigo ao Padrinho...');
    const { error: linkError } = await supabase
        .from('profiles')
        .update({ referred_by: REFERRER_ID })
        .eq('id', FRIEND_ID);

    if (linkError) {
        console.error('❌ Erro ao vincular:', linkError.message);
        return;
    }
    console.log('✅ Amigo vinculado com sucesso.');

    // 2. Criar um Pedido para o Amigo
    console.log('\nStep 2: Criando pedido de teste para o Amigo...');
    const orderId = require('crypto').randomUUID();
    const { error: orderError } = await supabase
        .from('pedidos')
        .insert({
            id: orderId,
            user_id: 'e7135084-3c6c-4977-8025-a7732d8495f5', // user_id real do perfil TGL (precisamos saber o user_id real)
            numero_pedido: 'TEST-' + Date.now().toString().slice(-4),
            valor_total: 100.00,
            valor_produtos: 100.00,
            status: 'pendente'
        });

    // Nota: Precisamos do user_id (UUID do Auth) para o pedido, não o ID do profile.
    // Vamos buscar o user_id correto.
    const { data: friendProfile } = await supabase.from('profiles').select('user_id').eq('id', FRIEND_ID).single();
    const authUserId = friendProfile.user_id;

    // Tenta inserir novamente com o authUserId correto
    const { error: orderError2 } = await supabase
        .from('pedidos')
        .insert({
            id: orderId,
            user_id: authUserId,
            numero_pedido: 'TEST-' + Date.now().toString().slice(-4),
            valor_total: 100.00,
            valor_produtos: 100.00,
            status: 'pendente'
        });

    if (orderError2) {
        console.error('❌ Erro ao criar pedido:', orderError2.message);
        return;
    }
    console.log(`✅ Pedido ${orderId} criado.`);

    // 3. Simular Pagamento via Webhook
    console.log('\nStep 3: Simulando aprovação de pagamento (Webhook)...');
    try {
        const PORT = process.env.PORT || 3000;
        const response = await axios.post(`http://localhost:${PORT}/api/webhooks/stripe`, {
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_test_' + Date.now(),
                    metadata: { orderId: orderId }
                }
            }
        }, {
            headers: { 'x-test-bypass': 'true' }
        });
        console.log('✅ Resposta do Webhook:', response.statusText);
    } catch (err) {
        console.error('❌ Erro ao chamar Webhook:', err.message);
        return;
    }

    // 4. Verificar Recompensa
    console.log('\nStep 4: Verificando se o Padrinho recebeu R$ 50...');

    // Espera um pouco para garantir que o webhook terminou o processamento assíncrono
    await new Promise(r => setTimeout(r, 2000));

    const { data: updatedReferrer } = await supabase
        .from('profiles')
        .select('saldo_creditos')
        .eq('id', REFERRER_ID)
        .single();

    const { data: credits } = await supabase
        .from('creditos')
        .select('*')
        .eq('user_id', REFERRER_ID)
        .eq('id_referencia', orderId);

    console.log(`\n--- RESULTADO FINAL ---`);
    console.log(`💰 Saldo do Padrinho: R$ ${updatedReferrer.saldo_creditos}`);

    if (credits && credits.length > 0) {
        console.log('✅ SUCESSO! Registro de crédito encontrado no histórico.');
        console.log(`📝 Detalhe: R$ ${credits[0].valor} - ${credits[0].descricao}`);
    } else {
        console.log('❌ FALHA! Nenhum registro de crédito encontrado.');
    }
}

testReferralFlow();
