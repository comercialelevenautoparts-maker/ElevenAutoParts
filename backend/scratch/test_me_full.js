const axios = require('axios');
require('dotenv').config();

async function testMe() {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const baseUrl = 'https://melhorenvio.com.br/api/v2';

    try {
        // 1. Perfil
        const userResponse = await axios.get(`${baseUrl}/me`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
            }
        });

        // 2. Endereços
        const addrResponse = await axios.get(`${baseUrl}/me/addresses`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
            }
        });

        const profile = userResponse.data;
        const addresses = addrResponse.data.data || addrResponse.data;
        const defaultAddr = addresses.find(addr => addr.default) || addresses[0];

        console.log('\n--- DADOS DE PERFIL ---');
        console.log(`Nome: ${profile.firstname} ${profile.lastname}`);
        console.log(`Email: ${profile.email}`);
        console.log(`Documento (CPF/CNPJ): ${profile.document}`);

        console.log('\n--- ENDEREÇO PADRÃO ---');
        console.log(`CEP: ${defaultAddr.postal_code}`);
        console.log(`Logradouro: ${defaultAddr.address}, ${defaultAddr.number}`);
        console.log(`Bairro: ${defaultAddr.district}`);
        console.log(`Cidade: ${defaultAddr.city.city} - ${defaultAddr.city.state.state_abbr}`);
        
    } catch (error) {
        console.error('Erro:', error.response?.data || error.message);
    }
}

testMe();
