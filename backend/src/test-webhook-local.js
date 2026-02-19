const axios = require('axios');

async function testWebhook() {
    try {
        console.log('Simulando envio de webhook para localhost:3000...');
        const response = await axios.post('http://localhost:3000/api/webhooks/stripe', {
            type: 'product.updated',
            data: {
                object: {
                    id: 'prod_TnAxRCwBJ', // Um ID real que vimos no log de sync
                    name: 'Teste de Sync',
                    description: 'Descrição atualizada via Teste'
                }
            }
        }, {
            headers: {
                'x-test-bypass': 'true' // Nosso webhook ignorará a assinatura se isso for true (fallback em dev)
            }
        });
        console.log('Resposta do servidor:', response.status, response.data);
    } catch (error) {
        console.error('Erro ao testar webhook:', error.message);
        if (error.response) {
            console.error('Dados do erro:', error.response.data);
        }
    }
}

testWebhook();
