require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function testConnection() {
    console.log('Testing Supabase Connection...');
    const { data, error } = await supabase.from('produtos').select('*').limit(1);
    
    if (error) {
        console.error('❌ Supabase Connection Error:', error.message);
        return;
    }
    
    console.log('✅ Supabase Connection OK. Data sample:', data);
    
    // Check columns
    const columns = Object.keys(data[0] || {});
    console.log('Detected Columns in "produtos":', columns);
    
    const required = ['stripe_product_id', 'stripe_price_id', 'preco', 'nome'];
    const missing = required.filter(col => !columns.includes(col));
    
    if (missing.length > 0) {
        console.warn('⚠️ Missing columns in "produtos" table:', missing);
    } else {
        console.log('✅ All required columns for Stripe sync are present.');
    }
}

testConnection();
