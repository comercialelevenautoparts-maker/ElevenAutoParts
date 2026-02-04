import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Needs Service Role for bypass RLS
);

async function syncProducts() {
    console.log('🚀 Iniciando sincronização com Stripe...');

    try {
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price']
        });

        console.log(`📦 Encontrados ${products.data.length} produtos no Stripe.`);

        for (const product of products.data) {
            const price = product.default_price as Stripe.Price;
            const priceAmount = (price?.unit_amount ?? 0) / 100;

            const productData = {
                stripe_product_id: product.id,
                stripe_price_id: price?.id || null,
                nome: product.name,
                descricao: product.description,
                imagem_principal: product.images[0] || null,
                preco: priceAmount,
                preco_promocional: product.metadata.preco_promocional ? parseFloat(product.metadata.preco_promocional) : null,
                marca: product.metadata.marca || null,
                carro: product.metadata.carro || null,
                conectores: product.metadata.conector || null,
                ativo: product.active,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('produtos')
                .upsert(productData, { onConflict: 'stripe_product_id' });

            if (error) {
                console.error(`❌ Erro ao sincronizar ${product.name}:`, error.message);
            } else {
                console.log(`✅ Sincronizado: ${product.name}`);
            }
        }

        console.log('✨ Sincronização concluída com sucesso!');
    } catch (error) {
        console.error('💥 Erro fatal na sincronização:', error);
    }
}

syncProducts();
