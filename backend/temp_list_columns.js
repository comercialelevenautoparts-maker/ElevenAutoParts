const sql = require('./src/config/database');

async function listColumns() {
    try {
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos';
    `;
        console.log('Columns in "pedidos" table:');
        columns.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));
        process.exit(0);
    } catch (err) {
        console.error('Error listing columns:', err);
        process.exit(1);
    }
}

listColumns();
