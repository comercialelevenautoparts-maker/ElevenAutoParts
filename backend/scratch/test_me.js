const axios = require('axios');
require('dotenv').config();

async function testMe() {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const baseUrl = 'https://melhorenvio.com.br/api/v2';

    try {
        const response = await axios.get(`${baseUrl}/me/addresses`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
            }
        });

        console.log('--- DADOS DO MELHOR ENVIO ---');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Erro:', error.response?.data || error.message);
    }
}

testMe();
