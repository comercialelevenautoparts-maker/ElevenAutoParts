const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Carregar .env do backend
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    console.error('❌ Faltam variáveis de ambiente (STRIPE_SECRET_KEY)');
    process.exit(1);
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);
const { syncProduct } = require('./services/stripeSyncService');

async function syncFromStripe() {
    console.log('🔄 Iniciando sincronização MANUAL da Stripe para o Supabase...\n');

    try {
        // 1. Buscar todos os produtos ativos da Stripe
        const stripeProducts = await stripe.products.list({ active: true, limit: 100 });
        console.log(`📦 Encontrados ${stripeProducts.data.length} produtos ativos na Stripe.`);

        // 2. Sincronizar cada um usando o serviço
        for (const product of stripeProducts.data) {
            await syncProduct(product.id);
        }

        console.log('\n✨ Sincronização manual concluída!');
    } catch (error) {
        console.error('\n❌ Erro fatal durante a sincronização:', error.message);
    }
}

syncFromStripe();
