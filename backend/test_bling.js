require('dotenv').config();
const BlingService = require('./src/services/BlingService');
const supabase = require('./src/config/supabase');

async function runTest() {
    try {
        console.log('Fetching a recent order...');
        const { data: order } = await supabase
            .from('pedidos')
            .select('id, numero_pedido')
            .not('numero_pedido', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!order) {
            console.log('No valid orders found');
            return;
        }

        console.log(`Found order ID: ${order.id} (${order.numero_pedido})`);
        
        console.log('Simulating Order Creation in Bling...');
        const result = await BlingService.createSalesOrder(order.id);
        console.log("Create Result:", JSON.stringify(result, null, 2));
        
        if (result.success && result.blingOrderId) {
            console.log(`Simulating NFe Emission for Bling order ${result.blingOrderId}...`);
            const nfeResult = await BlingService.emitirNFe(order.id, result.blingOrderId);
            console.log("NFe Result:", JSON.stringify(nfeResult, null, 2));
        }
    } catch (error) {
        if (error.response && error.response.data) {
            console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Test Error:', error.message);
        }
    }
}

runTest();
