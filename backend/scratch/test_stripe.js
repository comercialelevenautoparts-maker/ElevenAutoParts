const Stripe = require('stripe');
require('dotenv').config();

async function testStripeKey() {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Testando conexão com a chave Stripe (STRIPE_SECRET_KEY)...');
    
    try {
        const account = await stripe.accounts.retrieve();
        console.log('✅ Chave Stripe válida!');
        console.log(`Nome da Conta: ${account.settings?.dashboard?.display_name || 'Desconhecido'}`);
        console.log(`Email da Conta: ${account.email}`);
        console.log(`Modo Atual da Chave: ${process.env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'PRODUÇÃO (Live)' : 'TESTE'}`);
    } catch (error) {
        console.error('❌ Erro na chave do Stripe:', error.message);
    }
}

testStripeKey();
