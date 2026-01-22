const path = require('path');
const fs = require('fs');

// Garante que pega o .env da pasta backend, independente de onde o comando é rodado
const envPath = path.resolve(__dirname, '..', '.env');
console.log(`📂 Lendo configurações de: ${envPath}`);

if (!fs.existsSync(envPath)) {
    console.error(`❌ O arquivo .env não foi encontrado no caminho esperado: ${envPath}`);
    process.exit(1);
}

require('dotenv').config({ path: envPath });

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey || stripeKey.includes('SUA_CHAVE')) {
    console.error("\n❌ ERRO CRÍTICO: STRIPE_SECRET_KEY inválida ou não encontrada!");
    console.error("👉 Verifique se você editou o arquivo 'backend/.env' e colocou sua chave que começa com 'sk_test_...'.");
    console.error(`   Valor atual lido: ${stripeKey ? stripeKey.substring(0, 10) + '...' : 'undefined'}`);
    process.exit(1);
}

const stripe = require('stripe')(stripeKey);
const { createClient } = require('@supabase/supabase-js');

// Config do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERRO: Configurações do Supabase (URL/KEY) não encontradas no .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    console.log("\n🔍 === DIAGNÓSTICO DE INTEGRAÇÃO STRIPE <-> SUPABASE ===\n");

    // 1. Verificar Produtos na Stripe
    console.log("1️⃣  Buscando produtos NA STRIPE...");
    try {
        const stripeProducts = await stripe.products.list({ limit: 10, active: true });
        console.log(`✅ Encontrados ${stripeProducts.data.length} produtos ativos na Stripe.`);
        stripeProducts.data.forEach(p => {
            // Busca o preço associado
            const priceId = p.default_price;
            console.log(`   🔸 [Stripe] ${p.name}`);
            console.log(`      ID: ${p.id}`);
        });
    } catch (error) {
        console.error("❌ Erro ao conectar com Stripe. Verifique sua chave.");
        console.error("   Erro:", error.message);
        return;
    }

    console.log("\n---------------------------------------------------\n");

    // 2. Verificar Produtos no Banco de Dados (Supabase)
    console.log("2️⃣  Buscando produtos NO SUPABASE (Com Stripe ID)...");

    // Usando a tabela 'produtos' (português)
    const { data: dbProducts, error } = await supabase
        .from('produtos')
        .select('id, nome, stripe_product_id, stripe_price_id, ativo, estoque')
        .not('stripe_product_id', 'is', null);

    if (error) {
        console.error("❌ Erro ao conectar com Supabase:", error.message);
        if (error.code === '42P01') {
            console.error("   Dica: A tabela 'produtos' existe? Verifique se o nome está correto.");
        }
    } else {
        console.log(`✅ Encontrados ${dbProducts.length} produtos vinculados no banco.`);
        dbProducts.forEach(p => {
            console.log(`   🔹 [Banco] ${p.nome}`);
            console.log(`      ID Stripe: ${p.stripe_product_id}`);
            console.log(`      Preço ID: ${p.stripe_price_id ? '✅ ' + p.stripe_price_id : '❌ FALTANDO'}`);
            console.log(`      Ativo: ${p.ativo ? 'Sim' : 'Não'}`);
            console.log(`      Estoque: ${p.estoque}`);

            if (!p.stripe_price_id) {
                console.log("      ⚠️  ATENÇÃO: Produto sem ID de preço não permite checkout!");
            }
        });

        if (dbProducts.length === 0) {
            console.log("\n⚠️  ALERTA: Nenhum produto no banco tem 'stripe_product_id'.");
            console.log("   Isso significa que a sincronização não foi feita ou você está no banco errado.");
            console.log("   URL do Banco usada: " + supabaseUrl);
        }
    }

    console.log("\n---------------------------------------------------\n");
    console.log("🏁 Diagnóstico concluído.");
}

checkStatus();
