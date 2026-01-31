const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache em memória para evitar quedas se o Google Cloud oscilar
let cachedReviews = null;
let lastFetchTime = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 horas

/**
 * GET /api/reviews
 * Busca avaliações diretamente do Google Places API com Cache de segurança.
 */
router.get('/', async (req, res) => {
    const now = Date.now();

    // Se tivermos cache de menos de 12h, usamos ele para garantir estabilidade
    if (cachedReviews && (now - lastFetchTime < CACHE_DURATION)) {
        return res.json(cachedReviews);
    }

    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID;

        if (!apiKey || !placeId) {
            return res.status(500).json({ success: false, error: 'Configuração do Google ausente.' });
        }

        const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=pt-BR`;

        // Chamada ao Google limpando qualquer header de Referer que possa travar a API
        const googleResponse = await axios.get(googleUrl, {
            headers: { 'Referer': '' }
        });

        if (googleResponse.data.status !== 'OK') {
            console.error('Erro Google API:', googleResponse.data.status, googleResponse.data.error_message);

            // Se o Google falhar por motivo de restrição mas tivermos cache (mesmo antigo), usamos o cache
            if (cachedReviews) {
                console.log('Usando cache antigo devido a erro na API do Google.');
                return res.json(cachedReviews);
            }

            return res.status(400).json({
                success: false,
                error: `Erro Google (${googleResponse.data.status}): ${googleResponse.data.error_message || 'Acesso Negado'}`
            });
        }

        const reviews = (googleResponse.data.result.reviews || []).map((r, index) => ({
            id: `google-${r.time}-${index}`,
            name: r.author_name,
            rating: r.rating,
            text: r.text,
            photo: r.profile_photo_url,
            source: 'google',
            date: r.relative_time_description
        }));

        // Salva no cache para a próxima vez
        cachedReviews = reviews;
        lastFetchTime = now;

        res.json(reviews);

    } catch (error) {
        console.error('Erro ao buscar reviews:', error.message);
        if (cachedReviews) return res.json(cachedReviews);
        res.status(500).json({ success: false, error: 'Erro ao carregar avaliações em tempo real.' });
    }
});

module.exports = router;
