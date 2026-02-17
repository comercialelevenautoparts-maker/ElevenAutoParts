require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const BlingService = require('./src/services/BlingService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const TEST_EMAIL = 'comercial.elevenautoparts@gmail.com';
const USER_ID = 'a46c5c42-4289-4f43-acf4-986b71e0cc46';

const TEST_CPF = '04755585619';

async function simulatePurchase(method) {
    console.log(`\n🛒 Iniciando Compra Simulada - Método: ${method}`);

    try {
        // 1. Garantir dados do perfil (CPF é obrigatório para NF-e real)
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', USER_ID).single();
        if (profile.cpf !== TEST_CPF) {
            console.log('   🛠️ Atualizando CPF para emissão real...');
            await supabase.from('profiles').update({ cpf: TEST_CPF, nome: 'Eleven Teste V3' }).eq('user_id', USER_ID);
        }

        // 2. Garantir Endereço
        let { data: address } = await supabase.from('enderecos').select('*').eq('user_id', USER_ID).limit(1).maybeSingle();
        if (!address) {
            const { data: newAddr } = await supabase.from('enderecos').insert({
                user_id: USER_ID,
                cep: '06711020',
                logradouro: 'Avenida João Paulo Ablas',
                numero: '1764',
                bairro: 'Jardim da Glória',
                cidade: 'Cotia',
                uf: 'SP'
            }).select().single();
            address = newAddr;
        }

        // 3. Pegar um Produto Real
        const { data: product } = await supabase.from('produtos').select('*').limit(1).single();

        const randomFreight = Number((0.01 + Math.random() * 0.1).toFixed(2));
        const orderNum = `REAL-${method.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        console.log('   📦 Criando pedido no Supabase...');
        const { data: order, error: orderErr } = await supabase.from('pedidos').insert({
            user_id: USER_ID,
            endereco_id: address.id,
            numero_pedido: orderNum,
            status: 'pago', // Simulação de aprovação automática
            valor_produtos: Number(product.preco),
            valor_frete: randomFreight,
            valor_total: Number(product.preco) + randomFreight,
            forma_pagamento: method,
            nfe_status: 'pendente'
        }).select().single();

        if (orderErr) throw orderErr;

        // 5. Criar Itens do Pedido
        await supabase.from('pedido_itens').insert({
            pedido_id: order.id,
            produto_id: product.id,
            nome_produto: product.nome,
            quantidade: 1,
            preco_unitario: Number(product.preco),
            subtotal: Number(product.preco)
        });

        console.log(`   ✅ Pedido ${order.id} criado e pago!`);

        // 6. Integração Bling - Criar Pedido de Venda
        console.log('   📡 Enviando para Bling (Pedido de Venda)...');
        const blingResult = await BlingService.createSalesOrder(order.id);
        const blingOrderId = blingResult.blingOrderId;

        // 7. Integração Bling - Gerar NF-e Real
        console.log('   🧾 Solicitando Emissão de NF-e Real no Bling...');
        // Aguarda um pouco para o Bling processar o pedido
        await new Promise(resolve => setTimeout(resolve, 2000));

        const nfeResult = await BlingService.emitirNFe(blingOrderId);

        console.log('\n================================================');
        console.log(`🎊 FLUXO CONCLUÍDO PARA: ${method}`);
        console.log(`- Pedido Bling: ${blingOrderId}`);
        console.log(`- NF-e ID: ${nfeResult.nfeId}`);
        console.log(`- Link p/ Acompanhar: https://www.bling.com.br/pedidos.vendas.php#edit/${blingOrderId}`);
        console.log('================================================\n');

    } catch (err) {
        console.error(`\n🔴 Erro na simulação (${method}):`, err.message);
        if (err.response?.data) {
            console.error('Detalhes do Erro no Bling:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

async function runTests() {
    console.log('🚀 Iniciando Ciclo de Testes Reais (Bling V3)');

    // Teste 1: Cartão
    await simulatePurchase('card');

    // Teste 2: Boleto
    await simulatePurchase('boleto');

    console.log('\n🏁 Todos os testes finalizados.');
    process.exit();
}

runTests();
