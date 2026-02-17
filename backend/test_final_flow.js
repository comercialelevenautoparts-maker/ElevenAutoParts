require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const BlingService = require('./src/services/BlingService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runTest() {
    console.log('🚀 Iniciando Teste de Fluxo Completo (V3)\n');

    try {
        // 1. Pegar Dados Necessários
        console.log('1. Coletando dados base...');
        const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
        const { data: address } = await supabase.from('enderecos').select('*').eq('user_id', profile.user_id).limit(1).maybeSingle();
        const { data: product } = await supabase.from('produto').select('*').limit(1).maybeSingle();

        if (!profile || !address || !product) {
            console.error('❌ Erro: Certifique-se de que existam Perfil, Endereço e Produto no banco.');
            return;
        }

        console.log(`   - Perfil: ${profile.email}`);
        console.log(`   - Endereço: ${address.logradouro}, ${address.numero}`);
        console.log(`   - Produto: ${product.nome} (SKU: ${product.sku})`);

        // 2. Criar Pedido
        console.log('\n2. Criando registro em "pedidos"...');
        const orderNum = `T-${Date.now()}`;
        const { data: order, error: orderErr } = await supabase.from('pedidos').insert({
            user_id: profile.user_id,
            endereco_id: address.id,
            numero_pedido: orderNum,
            status: 'pago',
            valor_produtos: Number(product.preco),
            valor_frete: 10.00,
            valor_desconto: 0,
            valor_total: Number(product.preco) + 10.00,
            forma_pagamento: 'cartao',
            nfe_status: 'pendente'
        }).select().single();

        if (orderErr) throw orderErr;
        console.log(`   ✅ Pedido criado: ${order.id}`);

        // 3. Criar Item
        console.log('\n3. Criando registro em "item_pedido"...');
        const { data: item, error: itemErr } = await supabase.from('item_pedido').insert({
            id_pedido: order.id,
            id_produto: product.id_produto,
            quantidade: 1,
            preco_unitario: Number(product.preco)
        }).select().single();

        if (itemErr) {
            console.error('   ❌ Erro ao criar item:', itemErr.message);
            // Se falhar o item, o teste do Bling vai falhar, mas vamos tentar seguir com o que temos
        } else {
            console.log(`   ✅ Item criado para o pedido ${order.id}`);
        }

        // 4. Disparar Bling
        console.log('\n4. Disparando integração com Bling...');
        const result = await BlingService.createSalesOrder(order.id);

        console.log('\n================================================');
        console.log('✅ SUCESSO NO FLUXO COMPLETO!');
        console.log(`- Pedido Supabase: ${order.id}`);
        console.log(`- Pedido Bling V3: ${result.blingOrderId}`);
        console.log(`- Link para visualizar: https://www.bling.com.br/pedidos.vendas.php#edit/${result.blingOrderId}`);
        console.log('================================================\n');

    } catch (err) {
        console.error('\n🔴 ERRO DURANTE O TESTE:');
        console.error(err.message);
        if (err.response?.data) {
            console.error('Detalhes da API:', JSON.stringify(err.response.data, null, 2));
        }
    } finally {
        process.exit();
    }
}

runTest();
