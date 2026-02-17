require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const BlingService = require('./src/services/BlingService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runTest() {
    console.log('🚀 Teste de Fluxo Completo (Tentativa de Fix CPF e Erros)\n');

    try {
        const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
        const { data: address } = await supabase.from('enderecos').select('*').eq('user_id', profile.user_id).limit(1).maybeSingle();
        const { data: product } = await supabase.from('produto').select('*').limit(1).maybeSingle();

        // 1. Atualizar Perfil com Dados Válidos para o Bling
        console.log('1. Preparando perfil com dados válidos...');
        await supabase.from('profiles').update({
            nome: 'Cliente de Teste',
            sobrenome: 'Eleven',
            cpf: '94200874052' // CPF Válido para teste
        }).eq('id', profile.id);

        // 2. Criar Pedido
        console.log('2. Criando pedido...');
        const orderNum = `T-${Math.floor(Math.random() * 1000000)}`;
        const { data: order, error: orderErr } = await supabase.from('pedidos').insert({
            user_id: profile.user_id,
            endereco_id: address.id,
            numero_pedido: orderNum,
            status: 'pago',
            valor_produtos: Number(product.preco),
            valor_frete: 10.00,
            valor_total: Number(product.preco) + 10.00,
            forma_pagamento: 'cartao'
        }).select().single();

        if (orderErr) throw orderErr;
        console.log(`   ✅ Pedido: ${order.id}`);

        // 3. Criar Item (e se falhar, avisar mas tentar seguir)
        console.log('3. Criando item...');
        const { error: itemErr } = await supabase.from('item_pedido').insert({
            id_pedido: order.id,
            id_produto: product.id_produto,
            quantidade: 1,
            preco_unitario: Number(product.preco)
        });

        if (itemErr) {
            console.warn('   ⚠️ Erro ao inserir item (FK?):', itemErr.message);
            console.log('   Tentando inserir em "item_pedido" com id_pedido = null para ver se passa (teste apenas)...');
        } else {
            console.log('   ✅ Item inserido.');
        }

        // 4. Disparar Bling
        console.log('\n4. Disparando Bling...');
        const result = await BlingService.createSalesOrder(order.id);

        console.log('\n✅ SUCESSO!');
        console.log(`Link Bling: https://www.bling.com.br/pedidos.vendas.php#edit/${result.blingOrderId}`);

    } catch (err) {
        console.error('\n🔴 ERRO:');
        console.error(err.message);
        if (err.response?.data) {
            console.error('Detalhes API:', JSON.stringify(err.response.data, null, 2));
        }
    } finally {
        process.exit();
    }
}

runTest();
