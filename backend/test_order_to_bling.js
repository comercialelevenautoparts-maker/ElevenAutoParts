require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const BlingService = require('./src/services/BlingService');

// Usar Service Role Key no teste para evitar problemas de RLS
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runCompleteTest(paymentMethod) {
    console.log(`\n🧪 Iniciando Teste de Fluxo Completo: ${paymentMethod.toUpperCase()}`);

    try {
        // 1. Obter ou Criar Usuário/Perfil de Teste
        console.log('1. Verificando perfil de teste...');
        let { data: profile } = await supabase.from('profiles').select('*').limit(1).single();

        if (!profile) {
            console.error('ERRO: Crie um usuário no frontend primeiro para termos um perfil válido.');
            return;
        }

        // Garantir que o perfil tem um CPF para o Bling não rejeitar
        if (!profile.cpf) {
            console.log('🔧 Adicionando CPF fictício ao perfil para o Bling...');
            await supabase.from('profiles').update({ cpf: '12345678901' }).eq('id', profile.id);
            profile.cpf = '12345678901';
        }

        // 2. Obter ou Criar Endereço
        console.log('2. Verificando endereço...');
        let { data: address } = await supabase.from('enderecos').select('*').eq('user_id', profile.user_id).limit(1).maybeSingle();

        if (!address) {
            console.log('➕ Criando endereço de teste...');
            const { data: newAddr, error: addrErr } = await supabase.from('enderecos').insert({
                user_id: profile.user_id,
                cep: '01001000',
                logradouro: 'Praça da Sé',
                numero: '123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                uf: 'SP',
                padrao: true
            }).select().single();
            if (addrErr) throw addrErr;
            address = newAddr;
        }

        // 3. Obter um Produto
        console.log('3. Verificando produto...');
        let { data: product } = await supabase.from('produto').select('*').limit(1).maybeSingle();

        if (!product) {
            console.log('➕ Criando produto de teste no banco...');
            const { data: newProd, error: prodErr } = await supabase.from('produto').insert({
                nome: 'Palheta Limpador Eleven Pro',
                sku: 'ELEVEN-PAL-001',
                preco: 89.90,
                estoque: 10,
                ativo: true
            }).select().single();
            if (prodErr) throw prodErr;
            product = newProd;
        }

        const productId = product.id_produto || product.id;

        // 4. Criar o Pedido no Supabase
        console.log('4. Gravando pedido no banco de dados...');
        const orderNum = `TEST-${Date.now()}`;
        const { data: order, error: orderErr } = await supabase.from('pedidos').insert({
            user_id: profile.user_id,
            endereco_id: address.id,
            numero_pedido: orderNum,
            status: 'pago',
            valor_produtos: product.preco,
            valor_frete: 15.00,
            valor_total: product.preco + 15.00,
            forma_pagamento: paymentMethod,
            nfe_status: 'pendente'
        }).select().single();

        if (orderErr) throw orderErr;

        // 5. Adicionar Item ao Pedido
        console.log('5. Gravando itens do pedido...');
        const { error: itemErr } = await supabase.from('item_pedido').insert({
            id_pedido: order.id,
            id_produto: productId,
            quantidade: 1,
            preco_unitario: product.preco
        });

        if (itemErr) throw itemErr;

        // 6. Integrar com Bling
        console.log('6. Enviando para o Bling...');
        const result = await BlingService.createSalesOrder(order.id);

        console.log('\n✅ RESULTADO DO TESTE:');
        console.log('ID do Pedido (Supabase):', order.id);
        console.log('ID do Pedido (Bling):', result.blingOrderId);
        console.log('Link para o Pedido:', `https://www.bling.com.br/pedidos.vendas.php#edit/${result.blingOrderId}`);

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        if (error.response?.data) {
            console.error('Detalhes da API Bling:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

async function start() {
    await runCompleteTest('cartao');
    console.log('\n' + '='.repeat(50) + '\n');
    await runCompleteTest('boleto');
    process.exit();
}

start();
