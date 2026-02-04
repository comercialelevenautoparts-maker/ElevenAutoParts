const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const sql = require('../config/database');

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/**
 * Sincroniza um único produto da Stripe para o Supabase
 * @param {string} stripeProductId - ID do produto na Stripe (ex: prod_...)
 */
async function syncProduct(stripeProductId) {
    console.log(`\n🔹 [SyncService] Sincronizando produto: ${stripeProductId}`);

    try {
        // 1. Buscar o produto na Stripe
        const product = await stripe.products.retrieve(stripeProductId);
        if (!product.active) {
            console.log(`   ⚠️ Produto inativo na Stripe. Desativando no banco...`);
            await supabase
                .from('produtos')
                .update({ ativo: false })
                .eq('stripe_product_id', stripeProductId);
            return;
        }

        // 2. Buscar preço ativo
        const prices = await stripe.prices.list({
            product: stripeProductId,
            active: true,
            limit: 1
        });

        if (prices.data.length === 0) {
            console.log(`   ⚠️ Produto sem preço ativo. Ignorando.`);
            return;
        }

        const price = prices.data[0];
        const priceInReais = price.unit_amount / 100;

        // 3. Preparar Imagens (Principal + Extras)
        const allImages = [];

        // A. Imagens nativas da Stripe
        if (product.images && product.images.length > 0) {
            allImages.push(...product.images);
        }

        // B. Imagens via Metadados (chave: "imagens_extras")
        if (product.metadata && product.metadata.imagens_extras) {
            const metaImages = product.metadata.imagens_extras
                .split(',')
                .map(url => url.trim())
                .filter(url => url.length > 0);
            allImages.push(...metaImages);
        }

        // Remove duplicatas
        const uniqueImages = [...new Set(allImages)];

        // 4. Preparar dados para o banco
        const productData = {
            nome: product.name,
            descricao: product.description,
            preco: priceInReais,
            imagem_principal: uniqueImages[0] || null, // A primeira continua sendo a principal
            imagens: uniqueImages, // Nova coluna array text[]
            stripe_product_id: product.id,
            stripe_price_id: price.id,
            ativo: true,
            marca: product.metadata.marca || 'Stripe',
            updated_at: new Date().toISOString()
        };

        // 5. Upsert (Inserir ou Atualizar) no Supabase
        const { data: existingProduct } = await supabase
            .from('produtos')
            .select('id')
            .eq('stripe_product_id', product.id)
            .maybeSingle();

        if (existingProduct) {
            await supabase
                .from('produtos')
                .update(productData)
                .eq('id', existingProduct.id);
            console.log(`   ✅ Produto atualizado (ID: ${existingProduct.id}) com ${uniqueImages.length} imagens.`);
        } else {
            // Tenta achar por nome antes de criar novo
            const { data: sameName } = await supabase
                .from('produtos')
                .select('id')
                .ilike('nome', product.name)
                .maybeSingle();

            if (sameName) {
                await supabase
                    .from('produtos')
                    .update(productData)
                    .eq('id', sameName.id);
                console.log(`   ✅ Produto vinculado por nome (ID: ${sameName.id}) com ${uniqueImages.length} imagens.`);
            } else {
                await supabase
                    .from('produtos')
                    .insert([{ ...productData, estoque: 100 }]);
                console.log(`   ✅ Novo produto criado com ${uniqueImages.length} imagens!`);
            }
        }

    } catch (error) {
        console.error(`❌ Erro ao sincronizar produto ${stripeProductId}:`, error.message);
    }
}

/**
 * Triggered on price updates. Finds the product linked to this price and syncs it.
 * @param {string} stripePriceId 
 */
async function syncPrice(stripePriceId) {
    try {
        const price = await stripe.prices.retrieve(stripePriceId, {
            expand: ['product']
        });
        if (price.product && typeof price.product === 'string') {
            await syncProduct(price.product);
        } else if (price.product && price.product.id) {
            await syncProduct(price.product.id);
        }
    } catch (error) {
        console.error(`❌ Erro ao sincronizar preço ${stripePriceId}:`, error.message);
    }
}

module.exports = { syncProduct, syncPrice };
