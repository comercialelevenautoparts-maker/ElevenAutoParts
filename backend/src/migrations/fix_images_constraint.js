const sql = require('../config/database');

async function fixConstraints() {
    console.log('🔧 Corrigindo constraints do banco de dados...');

    try {
        // 1. Dropar a constraint problemática antiga
        console.log('1. Removendo constraint antiga...');
        await sql`
      ALTER TABLE imagem_produto 
      DROP CONSTRAINT IF EXISTS imagem_produto_id_produto_principal_key;
    `;

        // 2. Criar uma nova constraint parcial (funciona apenas onde principal é true)
        console.log('2. Criando índice parcial para unicidade de principal=true...');
        await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS imagem_produto_unique_principal_idx 
      ON imagem_produto (id_produto) 
      WHERE principal = true;
    `;

        console.log('✅ Banco de dados corrigido com sucesso! Agora suporta múltiplas imagens secundárias.');
    } catch (error) {
        console.error('❌ Erro ao corrigir banco:', error);
    } finally {
        process.exit();
    }
}

fixConstraints();
