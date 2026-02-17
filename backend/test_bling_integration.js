require('dotenv').config();
const BlingService = require('./src/services/BlingService');

async function runTests() {
    console.log('🚀 Iniciando Testes de Integração Bling V3...\n');

    try {
        // 1. Verificar Status da Integração
        console.log('--- 1. Verificando Integração no Banco de Dados ---');
        const status = await BlingService.getStatus();
        console.log('Status:', status.connected ? '✅ Conectado' : '❌ Não Conectado');

        if (!status.connected) {
            console.log('\n⚠️  ERRO: Você precisa autenticar primeiro acessando http://localhost:3000/api/bling/auth no navegador.');
            return;
        }

        // 2. Tentar Buscar Produtos (Validar Leitura)
        console.log('\n--- 2. Testando Leitura (Buscar Produtos) ---');
        try {
            const products = await BlingService.getProducts();
            console.log('✅ Sucesso: Conexão de leitura estável.');
            console.log('Total de produtos encontrados:', (products.data || []).length);
        } catch (err) {
            console.log('❌ Erro na leitura:', err.response?.data || err.message);
        }

        // 3. Tentar Criar um Produto de Teste (Validar Escrita)
        console.log('\n--- 3. Testando Escrita (Criar Produto de Teste) ---');
        const uniqueId = new Date().getTime();
        const testProduct = {
            nome: `Peça de Teste Eleven #${uniqueId}`,
            codigo: `SKU-${uniqueId}`,
            preco: 99.90,
            tipo: "P",
            situacao: "A",
            formato: "S",
            descricaoCurta: "Produto gerado via script de teste automotivo."
        };

        try {
            const result = await BlingService.createProduct(testProduct);
            console.log('✅ Sucesso: Produto criado no Bling!');
            console.log('ID do Produto no Bling:', result.data.id);
            console.log('Verifique no painel do Bling em: Cadastros > Produtos');
        } catch (err) {
            console.log('❌ Erro na escrita:', err.response?.data || err.message);
            if (err.response?.data?.error?.type === 'PERMISSION_DENIED') {
                console.log('⚠️  DICA: Verifique se você marcou "Incluir e Editar" nas permissões de Produtos no Bling.');
            }
        }

    } catch (error) {
        console.error('\n🔴 Erro inesperado durante os testes:', error.message);
    } finally {
        console.log('\n--- Testes Finalizados ---');
        process.exit();
    }
}

runTests();
