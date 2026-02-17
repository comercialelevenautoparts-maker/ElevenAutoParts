require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const BlingService = require('./src/services/BlingService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testSingleTable() {
    try {
        console.log('--- Testando Inserção em Pedidos ---');
        const { data: profile } = await supabase.from('profiles').select('user_id').limit(1).single();
        const { data: addr } = await supabase.from('enderecos').select('id').limit(1).single();

        const newOrderId = `TEST-${Date.now()}`;
        const { data: order, error: orderErr } = await supabase.from('pedidos').insert({
            user_id: profile.user_id,
            endereco_id: addr.id,
            numero_pedido: newOrderId,
            status: 'pago',
            valor_total: 100
        }).select().single();

        if (orderErr) {
            console.error('Erro ao inserir pedido:', orderErr);
            return;
        }

        console.log('✅ Pedido inserido com ID:', order.id);

        // Verificar se ele existe
        const { data: check, error: checkErr } = await supabase.from('pedidos').select('id').eq('id', order.id).single();
        if (checkErr) {
            console.error('❌ Erro ao verificar pedido recém-criado:', checkErr);
        } else {
            console.log('🔍 Pedido encontrado na verificação:', check.id);
        }

        console.log('\n--- Testando Inserção em Item Pedido ---');
        const { data: prod } = await supabase.from('produto').select('id_produto, preco').limit(1).single();

        const { data: item, error: itemErr } = await supabase.from('item_pedido').insert({
            id_pedido: order.id,
            id_produto: prod.id_produto,
            quantidade: 1,
            preco_unitario: prod.preco
        }).select().single();

        if (itemErr) {
            console.error('❌ Erro ao inserir item_pedido:', itemErr);
            console.error('Tentando com o ID do pedido que acabamos de criar:', order.id);
        } else {
            console.log('✅ Item inserido com sucesso!');
        }

    } catch (err) {
        console.error('Erro Global:', err.message);
    } finally {
        process.exit();
    }
}

testSingleTable();
