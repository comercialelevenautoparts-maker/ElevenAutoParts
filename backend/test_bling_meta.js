require('dotenv').config();
const BlingService = require('./src/services/BlingService');
const supabase = require('./src/config/supabase');
const { v4: uuidv4 } = require('uuid');

async function testBlingWithMetadata() {
    console.log("==================================================");
    console.log("🛠️  TESTE DE INTEGRAÇÃO BLING COM METADADOS  🛠️");
    console.log("==================================================");

    try {
        // 1. Buscar um usuário de teste (usando o comercial como no outro script)
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'comercial.elevenautoparts@gmail.com')
            .single();

        if (profileErr || !profile) {
            console.error("❌ Perfil de teste não encontrado.");
            return;
        }

        // 2. Buscar um endereço
        const { data: address } = await supabase
            .from('enderecos')
            .select('id')
            .eq('user_id', profile.user_id)
            .limit(1)
            .maybeSingle();

        // 3. Criar um Pedido Fictício
        const orderId = uuidv4();
        const numeroPedido = `TESTE-META-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        console.log(`📝 Criando pedido de teste: ${numeroPedido}...`);
        
        const { error: orderErr } = await supabase.from('pedidos').insert({
            id: orderId,
            user_id: profile.user_id,
            endereco_id: address?.id || null,
            numero_pedido: numeroPedido,
            status: 'pago',
            valor_produtos: 50.00,
            valor_frete: 15.00,
            valor_total: 65.00,
            forma_pagamento: 'pix',
            created_at: new Date().toISOString()
        });

        if (orderErr) throw orderErr;

        // 4. Criar Item com o METADATA do veículo
        console.log("📦 Adicionando item com metadados do veículo (Palheta + VW GOL 2018)...");
        
        const { data: product } = await supabase.from('produtos').select('*').limit(1).single();
        
        const itemMetadata = {
            veiculo: {
                marca: "VOLKSWAGEN",
                modelo: "GOL",
                ano: "2018",
                medidas: { motorista: "22", passageiro: "16" },
                conector: "Gancho"
            }
        };

        // Criar um produto temporário com SKU único para este teste
        const uniqueSKU = `SKU-TEST-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const { data: tempProduct, error: prodErr } = await supabase.from('produtos').insert({
            id: uuidv4(),
            nome: "Palheta de Teste com Metadados",
            sku: uniqueSKU,
            preco: 50.00
        }).select().single();

        if (prodErr) throw prodErr;

        const { error: itemErr } = await supabase.from('pedido_itens').insert({
            id: uuidv4(),
            pedido_id: orderId,
            produto_id: tempProduct.id,
            nome_produto: tempProduct.nome,
            quantidade: 1,
            preco_unitario: 50.00,
            subtotal: 50.00,
            metadata: itemMetadata
        });

        if (itemErr) throw itemErr;

        console.log("✅ Pedido e itens criados no banco.");
        console.log("\n🚀 DISPARANDO INTEGRAÇÃO COM O BLING...");

        // 5. Testar a criação do pedido no Bling
        const result = await BlingService.createSalesOrder(orderId);
        
        console.log("\n--- RESULTADO CRIAÇÃO PEDIDO ---");
        console.log(JSON.stringify(result, null, 2));

        if (result.success && result.blingOrderId) {
            console.log(`\n🚀 DISPARANDO EMISSÃO DE NF-E PARA O PEDIDO ${result.blingOrderId}...`);
            
            try {
                const nfeResult = await BlingService.emitirNFe(orderId, result.blingOrderId);
                console.log("\n--- RESULTADO EMISSÃO NF-E ---");
                console.log(JSON.stringify(nfeResult, null, 2));
                
                console.log("\n✅ SUCESSO COMPLETO!");
                console.log("A DANFE deve estar disponível agora no seu painel administrativo.");
            } catch (nfeErr) {
                console.error("\n❌ ERRO NA EMISSÃO DA NF-E:");
                if (nfeErr.response?.data) {
                    console.error(JSON.stringify(nfeErr.response.data, null, 2));
                } else {
                    console.error(nfeErr.message);
                }
            }
        }

    } catch (err) {
        console.error("❌ ERRO NO TESTE:", err.message);
        if (err.response?.data) {
            console.error("Detalhes da API:", JSON.stringify(err.response.data, null, 2));
        }
    }
}

testBlingWithMetadata();
