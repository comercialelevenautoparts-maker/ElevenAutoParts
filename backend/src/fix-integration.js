const path = require('path');
const fs = require('fs');

// Garante que pega o .env da pasta backend
const envPath = path.resolve(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
    console.error(`❌ O arquivo .env não foi encontrado: ${envPath}`);
    process.exit(1);
}
require('dotenv').config({ path: envPath });

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey.includes('SUA_CHAVE')) {
    console.error("❌ ERRO CRÍTICO: STRIPE_SECRET_KEY inválida! Edite o arquivo backend/.env");
    process.exit(1);
}

const stripe = require('stripe')(stripeKey);
const { createClient } = require('@supabase/supabase-js');

// Config do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERRO: Faltam chaves do Supabase no .env");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixIntegration() {
    console.log("🛠️  INICIANDO CORREÇÃO E CRIAÇÃO NA STRIPE...\n");

    const produtosParaCriar = [
        {
            nomeBanco: 'Conector Ecoflex',
            nomeStripe: 'Conector Ecoflex',
            preco: 4790, // R$ 47,90
            img: 'https://images.unsplash.com/photo-1635784385150-136f4d53006d?q=80&w=1000&auto=format&fit=crop'
        },
        {
            nomeBanco: 'Borracha Silicone Premium',
            nomeStripe: 'Borracha Silicone Premium',
            preco: 2990, // R$ 29,90
            img: 'https://images.unsplash.com/photo-1542385412-42e61df60136?q=80&w=1000&auto=format&fit=crop'
        }
    ];

    for (const item of produtosParaCriar) {
        console.log(`Processing: ${item.nomeStripe}...`);

        try {
            // 1. Criar na Stripe
            const product = await stripe.products.create({
                name: item.nomeStripe,
                images: [item.img],
            });

            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: item.preco,
                currency: 'brl',
            });

            console.log(`   ✅ Criado na Stripe! Prod: ${product.id} | Price: ${price.id}`);

            // 2. Atualizar no Supabase
            const { data: prodBanco, error: searchError } = await supabase
                .from('produtos')
                .select('id')
                .ilike('nome', `%${item.nomeBanco}%`)
                .limit(1);

            if (!prodBanco || prodBanco.length === 0) {
                console.log(`   ⚠️  Produto não encontrado no banco pelo nome "${item.nomeBanco}".`);
                continue;
            }

            const idBanco = prodBanco[0].id;

            const { error: updateError } = await supabase
                .from('produtos')
                .update({
                    stripe_product_id: product.id,
                    stripe_price_id: price.id
                })
                .eq('id', idBanco);

            if (updateError) {
                console.error(`   ❌ Erro ao atualizar Supabase: ${updateError.message}`);
            } else {
                console.log(`   ✅ Banco atualizado com sucesso! (ID: ${idBanco} agora aponta para ${product.id})`);
            }

        } catch (err) {
            console.error(`   ❌ Erro no processo: ${err.message}`);
        }
    }

    console.log("\n✅ Processo finalizado. Reinicie os servidores frontend/backend por garantia.");
}

fixIntegration();
