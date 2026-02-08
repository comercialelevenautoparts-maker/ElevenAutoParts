const sql = require('./src/config/database');

async function addColumn() {
    try {
        console.log('Tentando adicionar coluna stripe_payment_id...');
        await sql`
      ALTER TABLE pedidos 
      ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
    `;
        console.log('Coluna adicionada ou já existente.');
        process.exit(0);
    } catch (err) {
        console.error('Erro ao adicionar coluna:', err);
        process.exit(1);
    }
}

addColumn();
