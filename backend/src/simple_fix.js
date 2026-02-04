const sql = require('../config/database');

async function fix() {
    console.log('🔧 Iniciando correção forçada do banco...');
    try {
        // Remove a regra que impede múltiplas imagens
        await sql`ALTER TABLE imagem_produto DROP CONSTRAINT IF EXISTS imagem_produto_id_produto_principal_key`;

        console.log('✅ Correção aplicada com sucesso! Agora você pode ter várias imagens.');
    } catch (e) {
        console.error('Erro:', e.message);
    }
    process.exit();
}

fix();
