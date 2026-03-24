require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// Configurações
const WEBHOOK_URL = 'https://www.elevenautoparts.com.br/api/webhooks/stripe';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function simulateStripeUpdate() {
    console.log('🚀 Iniciando Simulação de Webhook Stripe: product.updated');
    
    // 1. Criar o Payload (Exemplo de produto da Stripe)
    const payload = {
        id: "evt_test_" + Date.now(),
        object: "event",
        api_version: "2023-10-16",
        created: Math.floor(Date.now() / 1000),
        data: {
            object: {
                id: "prod_RiU5839YIsXm2n", // ID real ou fictício para teste
                object: "product",
                active: true,
                attributes: [],
                created: 1731671234,
                description: "Produto Teste Webhook " + new Date().toLocaleTimeString(),
                images: ["https://files.stripe.com/links/fl_live_test"],
                livemode: false,
                metadata: {
                    marca: "Teste Automatizado"
                },
                name: "Peça de Teste Eleven " + new Date().toLocaleTimeString(),
                package_dimensions: null,
                shippable: null,
                statement_descriptor: null,
                tax_code: "txcd_10000000",
                unit_label: null,
                updated: Math.floor(Date.now() / 1000),
                url: null
            }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
            id: null,
            idempotency_key: null
        },
        type: "product.updated"
    };

    const payloadString = JSON.stringify(payload);

    // 2. Gerar Assinatura (se o secret existir)
    let headers = {
        'Content-Type': 'application/json'
    };

    if (STRIPE_WEBHOOK_SECRET) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signedPayload = `${timestamp}.${payloadString}`;
        const signature = crypto
            .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
            .update(signedPayload)
            .digest('hex');
        
        headers['stripe-signature'] = `t=${timestamp},v1=${signature}`;
        console.log('🔐 Assinatura gerada para o teste.');
    } else {
        headers['x-test-bypass'] = 'true';
        console.log('⚠️ Enviando sem assinatura (bypass).');
    }

    // 3. Enviar POST
    try {
        console.log('📡 Enviando requisição para:', WEBHOOK_URL);
        const response = await axios.post(WEBHOOK_URL, payloadString, { headers });
        console.log(`✅ Resposta do Servidor: ${response.status} ${response.statusText}`);
        console.log('Acesse os logs do backend para ver o resultado da sincronização.');
    } catch (error) {
        console.error('❌ Erro ao enviar webhook:', error.response ? error.response.data : error.message);
    }
}

simulateStripeUpdate();
