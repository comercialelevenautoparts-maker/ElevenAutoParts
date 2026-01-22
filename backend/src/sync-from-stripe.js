const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Carregar .env do backend
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Faltam variáveis de ambiente (STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_KEY)');
    process.exit(1);
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncFromStripe() {
    console.log('🔄 Iniciando sincronização da Stripe para o Supabase...\n');

    try {
        // 1. Buscar todos os produtos ativos da Stripe
        const stripeProducts = await stripe.products.list({ active: true });
        console.log(`📦 Encontrados ${stripeProducts.data.length} produtos ativos na Stripe.`);

        // 2. Desativar produtos no Supabase que não estão na Stripe (opcional, mas recomendado para o teste)
        // console.log('🧹 Desativando produtos antigos no banco...');
        // await supabase.from('produtos').update({ ativo: false }).not('stripe_product_id', 'is', null);

        for (const product of stripeProducts.data) {
            console.log(`\n🔹 Sincronizando: ${product.name} (${product.id})`);

            // Buscar o preço ativo para este produto
            const prices = await stripe.prices.list({
                product: product.id,
                active: true,
                limit: 1
            });

            if (prices.data.length === 0) {
                console.log(`   ⚠️  Aviso: Produto sem preço ativo na Stripe. Pulando...`);
                continue;
            }

            const price = prices.data[0];
            const priceInReais = price.unit_amount / 100;

            // Verificar se o produto já existe no Supabase por stripe_product_id
            const { data: existingProduct } = await supabase
                .from('produtos')
                .select('id')
                .eq('stripe_product_id', product.id)
                .maybeSingle();

            const productData = {
                nome: product.name,
                descricao: product.description,
                preco: priceInReais,
                imagem_principal: product.images[0] || null,
                stripe_product_id: product.id,
                stripe_price_id: price.id,
                ativo: true,
                marca: product.metadata.marca || 'Stripe',
                updated_at: new Date().toISOString()
            };

            if (existingProduct) {
                // Atualizar
                const { error: updateError } = await supabase
                    .from('produtos')
                    .update(productData)
                    .eq('id', existingProduct.id);

                if (updateError) console.error(`   ❌ Erro ao atualizar: ${updateError.message}`);
                else console.log(`   ✅ Produto atualizado com sucesso!`);
            } else {
                // Tentar encontrar pelo nome para evitar duplicatas se o ID for novo
                const { data: sameNameProduct } = await supabase
                    .from('produtos')
                    .select('id')
                    .ilike('nome', product.name)
                    .maybeSingle();

                if (sameNameProduct) {
                    const { error: updateError } = await supabase
                        .from('produtos')
                        .update(productData)
                        .eq('id', sameNameProduct.id);

                    if (updateError) console.error(`   ❌ Erro ao vincular por nome: ${updateError.message}`);
                    else console.log(`   ✅ Produto existente vinculado à Stripe com sucesso!`);
                } else {
                    // Inserir novo
                    const { error: insertError } = await supabase
                        .from('produtos')
                        .insert([{ ...productData, estoque: 100 }]);

                    if (insertError) console.error(`   ❌ Erro ao inserir: ${insertError.message}`);
                    else console.log(`   ✅ Novo produto inserido no banco!`);
                }
            }
        }

        // 3. Marcar como inativos os produtos que têm stripe_price_id mas NÃO estão na lista atual da Stripe
        const stripeIds = stripeProducts.data.map(p => p.id);
        const { error: cleanupError } = await supabase
            .from('produtos')
            .update({ ativo: false })
            .not('stripe_product_id', 'is', null)
            .not('stripe_product_id', 'in', `(${stripeIds.join(',')})`);

        if (cleanupError) console.error(`\n❌ Erro ao limpar produtos antigos: ${cleanupError.message}`);

        console.log('\n✨ Sincronização concluída!');
    } catch (error) {
        console.error('\n❌ Erro fatal durante a sincronização:', error.message);
    }
}

syncFromStripe();
