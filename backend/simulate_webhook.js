require('dotenv').config();
const BlingService = require('./src/services/BlingService');
const supabase = require('./src/config/supabase');
const { v4: uuidv4 } = require('uuid');

async function createFakeOrderAndTest() {
    console.log("==================================================");
    console.log("🛠️  CRIANDO PEDIDO FICTÍCIO PARA TESTE DE NFE  🛠️");
    console.log("🛠️  USUÁRIO ALVO: comercial.elevenautoparts@gmail.com ");
    console.log("==================================================");

    try {
        // Encontra o usuário comercial.elevenautoparts@gmail.com
        const { data: targetProfile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'comercial.elevenautoparts@gmail.com')
            .single();

        if (profileErr || !targetProfile) {
            console.error("❌ Perfil 'comercial.elevenautoparts@gmail.com' não encontrado no banco.");
            return;
        }

        const targetUserId = targetProfile.user_id;

        // Pega um endereço para este usuário
        const { data: address } = await supabase
            .from('enderecos')
            .select('id')
            .eq('user_id', targetUserId)
            .limit(1)
            .single();

        const enderecoId = address ? address.id : null;

        // Pega o pedido mais recente como base para estrutura
        const { data: baseOrder } = await supabase
            .from('pedidos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!baseOrder) {
            console.log("❌ Nenhum pedido base encontrado no banco de dados.");
            return;
        }

        const { data: baseItems } = await supabase
            .from('pedido_itens')
            .select('*')
            .eq('pedido_id', baseOrder.id);
            
        // 1. Criar novo pedido para o usuário alvo
        const newOrderId = uuidv4();
        const randomStr = Math.random().toString(36).substring(7).toUpperCase();
        const fakeNumero = `#COMER-${randomStr}`;
        
        console.log(`📝 Criando pedido clone: ${newOrderId} (Nº ${fakeNumero})...`);
        const { error: insertOrderErr } = await supabase.from('pedidos').insert({
            ...baseOrder,
            id: newOrderId,
            user_id: targetUserId,
            endereco_id: enderecoId,      // Pode ser null se o usuário alvo não tiver salvo um 
            numero_pedido: fakeNumero,
            status: 'pago',
            nfe_status: null,
            nfe_key: null,
            nfe_link: null,
            created_at: new Date().toISOString()
        });

        if (insertOrderErr) {
            console.error("❌ Falha ao clonar pedido:", insertOrderErr);
            return;
        }

        const newItems = baseItems.map(item => ({
            ...item,
            id: uuidv4(),
            pedido_id: newOrderId
        }));

        const { error: insertItemsErr } = await supabase.from('pedido_itens').insert(newItems);
        
        if (insertItemsErr) {
            console.error("❌ Falha ao clonar itens:", insertItemsErr);
            return;
        }
        
        const fakeProductId = uuidv4();
        await supabase.from('produtos').insert({
            id: fakeProductId,
            nome: `Produto de Teste Comercial NFe ${randomStr}`,
            sku: `TEST-COMERCIAL-${randomStr}`,
            preco: 100,
            descricao: 'Criado dinamicamente para teste comercial',
        });
        
        await supabase.from('pedido_itens').update({ produto_id: fakeProductId, preco_unitario: 100 }).eq('pedido_id', newOrderId);

        console.log(`📦 Pedido TESTE criado com sucesso para o usuário ${targetProfile.email}!`);
        console.log("\n[Passo 1] Simulating webhook trigger -> BlingService.createSalesOrder...");
        
        let blingOrderId = null;
        
        try {
            const createResult = await BlingService.createSalesOrder(newOrderId);
            console.log("✅ Resposta de Criação de Pedido de Venda:");
            console.log(JSON.stringify(createResult, null, 2));
            blingOrderId = createResult.blingOrderId;
        } catch (createErr) {
            if(createErr.response?.data) {
                console.error("❌ Motivo (Bling API):", JSON.stringify(createErr.response.data, null, 2));
            } else {
                console.error("❌ Erro:", createErr.message);
            }
            return;
        }

        if (blingOrderId) {
            console.log(`\n[Passo 2] Disparando emissão de NF-e para Pedido Bling ID: ${blingOrderId}...`);
            try {
                const nfeResult = await BlingService.emitirNFe(newOrderId, blingOrderId);
                console.log("✅ Resposta de Emissão de NF-e:");
                console.log(JSON.stringify(nfeResult, null, 2));
                
                const { data: updatedOrder } = await supabase
                    .from('pedidos')
                    .select('nfe_status, nfe_key, nfe_link')
                    .eq('id', newOrderId)
                    .single();
                    
                console.log("\n📄 STATUS FINAL SALVO NO BANCO DE DADOS:");
                console.log(JSON.stringify(updatedOrder, null, 2));
            } catch (nfeErr) {
                if(nfeErr.response?.data) {
                    console.error("❌ Motivo (Bling API):", JSON.stringify(nfeErr.response.data, null, 2));
                } else {
                    console.error("❌ Erro Emissão NF-e:", nfeErr.message);
                }
            }
        }
        
    } catch (error) {
        console.error("Erro interno no teste:", error.message);
    }
}

createFakeOrderAndTest();
