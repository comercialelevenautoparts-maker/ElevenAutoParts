require('dotenv').config();
const axios = require('axios');

async function testGoogle() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    console.log('Testando Google Places API...');
    console.log('Place ID:', placeId);
    console.log('API Key (Início):', apiKey.substring(0, 10) + '...');

    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=pt-BR`;

    try {
        const response = await axios.get(googleUrl);
        console.log('Status HTTP:', response.status);
        console.log('Resposta do Google:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Erro na requisição:', error.message);
        if (error.response) {
            console.error('Status Erro:', error.response.status);
            console.error('Dados Erro:', error.response.data);
        }
    }
}

testGoogle();
