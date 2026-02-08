const sql = require('./src/config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function cleanOldOrders() {
    try {
        console.log('🔍 Buscando pedidos pendentes anteriores a 3 dias...');

        // 1. Data limite (3 dias atrás)
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 3);
        const dateLimitISO = dateLimit.toISOString();

        // 2. Buscar pedidos pendentes antigos
        const pendingOrders = await sql`
            SELECT id, created_at, status 
            FROM pedidos 
            WHERE status = 'pendente' 
            AND created_at < ${dateLimitISO}
        `;

        console.log(`📋 Encontrados ${pendingOrders.length} pedidos pendentes antigos.`);

        if (pendingOrders.length === 0) {
            console.log('✅ Nenhum pedido pendente antigo para limpar.');
            process.exit(0);
        }

        let updatedCount = 0;

        // 3. Iterar e cancelar
        for (const order of pendingOrders) {
            console.log(`⚠️ Cancelando pedido antigo ID: ${order.id} (Criado em: ${new Date(order.created_at).toLocaleString()})`);

            await sql`
                UPDATE pedidos 
                SET status = 'cancelado' 
                WHERE id = ${order.id}
            `;

            updatedCount++;
        }

        console.log(`✅ \nLimpeza concluída! ${updatedCount} pedidos foram cancelados por falta de pagamento (tempo excedido).`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Erro no script de limpeza:', err);
        process.exit(1);
    }
}

cleanOldOrders();
