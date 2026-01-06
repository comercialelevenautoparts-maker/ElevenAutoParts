// test-connection.js
require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

(async () => {
  try {
    const result = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    console.log('TABELAS NO BANCO:');
    result.forEach(r => console.log('  →', r.tablename));
  } catch (err) {
    console.error('ERRO:', err.message);
  } finally {
    await sql.end();
  }
})();