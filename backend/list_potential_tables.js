require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use SUPABASE_KEY (service role) if available, otherwise VITE_...
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    try {
        // There isn't a direct "list tables" in PostgREST, but we can query RPC or information_schema if allowed
        // Or we can just try to fetch a few common ones
        const tables = ['profiles', 'pedidos', 'produtos', 'creditos', 'carteira', 'referrals', 'indicacoes'];

        for (const table of tables) {
            const { error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`❌ Table ${table} NOT found or error:`, error.message);
            } else {
                console.log(`✅ Table ${table} EXISTS.`);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

listTables();
