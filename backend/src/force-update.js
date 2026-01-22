const path = require('path');
const fs = require('fs');

// Garante que pega o .env da pasta backend corretamente
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    console.error(`❌ O arquivo .env não foi encontrado em: ${envPath}`);
    process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

// Config do Supabase
// Tenta ler com VITE_ prefixo (frontend style) ou sem (backend style)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERRO: Credenciais do Supabase não encontradas no .env!");
    console.log("   Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY estão definidos em backend/.env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

async function forceUpdate() {
    console.log(`🔌 Conectando ao Supabase...`);

    // 1. Listar TODOS os produtos
    console.log("🔍 Buscando produtos existentes...");

    const { data: produtos, error } = await supabase
        .from('produtos')
        .select('id, nome');

    if (error) {
        console.error("❌ Erro ao buscar produtos:", error.message);
        return;
    }

    if (!produtos || produtos.length === 0) {
        console.error("⚠️ ALERTA: A tabela 'produtos' está VAZIA neste banco de dados!");
        return;
    }

    console.log(`✅ Encontrados ${produtos.length} produtos.\n`);

    // IDs gerados na Stripe (copiados dos logs anteriores)
    const updates = {
        'Conector Ecoflex': { prod: 'prod_TnBcgjrZ981QV4', price: 'price_1SpbFIGlsVhBSntvfUYVBfIa' },
        'Borracha Silicone Premium': { prod: 'prod_TnBcRvQqr13H0b', price: 'price_1SpbFKGlsVhBSntvOPrQueqN' }
    };

    let updatedCount = 0;

    for (const p of produtos) {
        let match = null;

        if (p.nome.includes('Conector Ecoflex')) match = updates['Conector Ecoflex'];
        else if (p.nome.includes('Borracha Silicone')) match = updates['Borracha Silicone Premium'];

        if (match) {
            console.log(`🔄 Atualizando: "${p.nome}" (ID: ${p.id})...`);

            const { error: updateError } = await supabase
                .from('produtos')
                .update({
                    stripe_product_id: match.prod,
                    stripe_price_id: match.price
                })
                .eq('id', p.id);

            if (updateError) {
                console.error(`   ❌ Falha: ${updateError.message}`);
            } else {
                console.log(`   ✅ SUCESSO! Stripe IDs vinculados.`);
                updatedCount++;
            }
        }
    }

    if (updatedCount === 0) {
        console.log("\n⚠️ Nenhuma correspondência de nome encontrada para atualização.");
    } else {
        console.log("\n🎉 Atualização concluída! Reinicie o frontend e teste.");
    }
}

forceUpdate();
