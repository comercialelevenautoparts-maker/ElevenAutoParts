const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

/**
 * POST /api/frete/calcular
 * Calcula o frete usando Melhor Envio (Simulado/Preparado)
 */
router.post('/calcular', async (req, res) => {
    const { cepDestino, itens } = req.body;

    if (!cepDestino || !itens || itens.length === 0) {
        return res.status(400).json({ error: 'CEP de destino e itens são obrigatórios' });
    }

    const cleanCepDestino = cepDestino.replace(/\D/g, '');
    const originCep = process.env.MELHOR_ENVIO_CEP_ORIGEM || '01001000'; // Default fallback
    const token = process.env.MELHOR_ENVIO_TOKEN;

    if (!token) {
        console.warn('MELHOR_ENVIO_TOKEN não configurado. Usando simulação.');
        // Fallback simulation if no token provided (prevents crash but alerts dev)
        return res.json(getSimulationResult());
    }

    try {
        // 1. Buscar dimensões reais dos produtos no banco
        const ids = itens.map(i => i.id);
        const { data: produtosData, error: dbError } = await supabase
            .from('produtos')
            .select('id, largura, altura, profundidade, peso')
            .in('id', ids);

        if (dbError) throw dbError;

        // 2. Montar objeto para API (Melhor Envio)
        const productsForShipping = itens.map(item => {
            const detail = produtosData.find(p => p.id === item.id);
            return {
                id: item.id,
                width: detail?.largura || 12,    // Defaults for palhetas
                height: detail?.altura || 4,
                length: detail?.profundidade || 65,
                weight: detail?.peso || 0.4,
                insurance_value: item.price,
                quantity: item.quantity
            };
        });

        const melhoEnvioUrl = process.env.MELHOR_ENVIO_ENV === 'production'
            ? 'https://melhorenvio.com.br/api/v2/me/shipment/calculate'
            : 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate';

        const response = await fetch(melhoEnvioUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
            },
            body: JSON.stringify({
                from: { postal_code: originCep },
                to: { postal_code: cleanCepDestino },
                products: productsForShipping
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro Melhor Envio:', errorData);
            return res.status(response.status).json({ error: 'Erro na API de frete' });
        }

        const data = await response.json();

        // Filtra serviços que não retornaram erro e formata para o frontend
        const result = data
            .filter(service => !service.error)
            .map(service => ({
                id: service.id,
                name: service.name,
                price: service.price,
                custom_price: service.custom_price || service.price,
                currency: 'BRL',
                delivery_time: service.delivery_time,
                company: {
                    name: service.company.name,
                    picture: service.company.picture
                }
            }));

        res.json(result);

    } catch (error) {
        console.error('Erro no cálculo de frete:', error);
        res.status(500).json({ error: 'Erro interno ao calcular frete' });
    }
});

function getSimulationResult() {
    return [
        {
            id: 1,
            name: 'PAC (Simulado)',
            price: '24.50',
            custom_price: '22.00',
            currency: 'BRL',
            delivery_time: 8,
            company: { name: 'Correios', picture: 'https://cdn.melhorenvio.com.br/img/shipping/correios.png' }
        },
        {
            id: 2,
            name: 'SEDEX (Simulado)',
            price: '48.90',
            custom_price: '45.00',
            currency: 'BRL',
            delivery_time: 3,
            company: { name: 'Correios', picture: 'https://cdn.melhorenvio.com.br/img/shipping/correios.png' }
        }
    ];
}

module.exports = router;
