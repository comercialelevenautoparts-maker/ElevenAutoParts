require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const BlingService = require('./src/services/BlingService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runTest() {
    console.log('🚀 Teste de FluxO FINAL (V3 - Oficial - Plural)\n');

    try {
        const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
        if (!profile) throw new Error('Crie um profile primeiro');

        // 1. Preparando perfil
        console.log('1. Preparando perfil...');
        await supabase.from('profiles').update({
            nome: 'Cliente Teste Bling V3',
            cpf: '94200874052'
        }).eq('id', profile.id);

        // 2. Garantir Endereço
        console.log('2. Verificando endereço...');
        let { data: address } = await supabase.from('enderecos').select('*').eq('user_id', profile.user_id).limit(1).maybeSingle();
        if (!address) {
            console.log('   ➕ Criando endereço...');
            const { data: newAddr, error: addrErr } = await supabase.from('enderecos').insert({
                user_id: profile.user_id,
                cep: '01001000',
                logradouro: 'Avenida Paulista',
                numero: '1000',
                bairro: 'Bela Vista',
                cidade: 'São Paulo',
                uf: 'SP'
            }).select().single();
            if (addrErr) throw addrErr;
            address = newAddr;
        }

        // 3. Garantir Produto (em PRODUTOS - plural)
        console.log('3. Verificando produto (produtos)...');
        let { data: product } = await supabase.from('produtos').select('*').limit(1).maybeSingle();
        if (!product) {
            console.log('   ➕ Criando produto...');
            const { data: newProd, error: prodErr } = await supabase.from('produtos').insert({
                nome: 'Palheta Eleven V3',
                sku: 'SKU-V3-001',
                preco: 129.90,
                ativo: true
            }).select().single();
            if (prodErr) throw prodErr;
            product = newProd;
        }

        // 4. Criar Pedido
        console.log('4. Criando pedido...');
        const orderNum = `T-${Math.floor(Math.random() * 1000000)}`;
        const { data: order, error: orderErr } = await supabase.from('pedidos').insert({
            user_id: profile.user_id,
            endereco_id: address.id,
            numero_pedido: orderNum,
            status: 'pago',
            valor_produtos: Number(product.preco),
            valor_frete: 10.00,
            valor_total: Number(product.preco) + 10.00,
            forma_pagamento: 'cartao',
            nfe_status: 'pendente'
        }).select().single();

        if (orderErr) throw orderErr;
        console.log(`   ✅ Pedido: ${order.id}`);

        // 5. Criar Item (vincular a PRODUTOS.id)
        console.log('5. Criando item (pedido_itens)...');
        const { error: itemErr } = await supabase.from('pedido_itens').insert({
            pedido_id: order.id,
            produto_id: product.id,
            nome_produto: product.nome,
            quantidade: 1,
            preco_unitario: Number(product.preco),
            subtotal: Number(product.preco)
        });

        if (itemErr) throw itemErr;
        console.log('   ✅ Item inserido.');

        // 6. Disparar Bling
        console.log('\n6. Disparando Bling...');
        const result = await BlingService.createSalesOrder(order.id);

        console.log('\n================================================');
        console.log('✅ SUCESSO TOTAL!');
        console.log(`Pedido Bling: ${result.blingOrderId}`);
        console.log(`Link: https://www.bling.com.br/pedidos.vendas.php#edit/${result.blingOrderId}`);
        console.log('================================================\n');

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
