
const crypto = require('crypto');
const axios = require('axios');

async function testSecret() {
    const secret = "whsec_DfJqBu4WhR1PiEHBVjmw9Z8l70RVIYW7";
    const payload = JSON.stringify({
        id: "evt_test",
        type: "payment_intent.succeeded",
        data: { object: { id: "pi_test", metadata: { orderId: "test_order" } } }
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `${timestamp}.${payload}`;
    const hmac = crypto.createHmac('sha256', secret)
        .update(signaturePayload)
        .digest('hex');

    const signature = `t=${timestamp},v1=${hmac}`;

    try {
        const response = await axios.post('http://localhost:3000/api/webhooks/stripe', payload, {
            headers: {
                'stripe-signature': signature,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ Validação Local: SUCESSO!");
        console.log("Status:", response.status);
    } catch (error) {
        console.log("❌ Validação Local: FALHOU");
        console.log("Mensagem:", error.response?.data || error.message);
    }
}

testSecret();
