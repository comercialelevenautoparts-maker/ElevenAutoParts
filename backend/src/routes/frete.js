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

/**
 * GET /api/frete/tracking/:code
 * Rastreia um pedido usando Melhor Envio ou Fallback
 */
router.get('/tracking/:code', async (req, res) => {
    const { code } = req.params;
    const token = process.env.MELHOR_ENVIO_TOKEN;

    console.log(`🔍 Buscando rastreio para o código: ${code}`);

    // TEST BYPASS: Se for um código de teste nosso, retorna mock formatado
    if (code.startsWith('ELEVEN-TEST')) {
        return res.json(getTestTrackingData(code));
    }

    if (!token) {
        return res.status(503).json({ error: 'Serviço de rastreio indisponível no momento.' });
    }

    try {
        const melhoEnvioUrl = process.env.MELHOR_ENVIO_ENV === 'production'
            ? 'https://melhorenvio.com.br/api/v2/me/shipment/tracking'
            : 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/tracking';

        const response = await fetch(melhoEnvioUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
            },
            body: JSON.stringify({ orders: [code] })
        });

        if (!response.ok) {
            throw new Error('Falha na comunicação com Melhor Envio');
        }

        const data = await response.json();

        // Melhor Envio retorna um objeto indexado pelo código do pedido ou ID
        const trackingInfo = data[code] || Object.values(data)[0];

        if (!trackingInfo || trackingInfo.error) {
            return res.status(404).json({ error: 'Objeto não encontrado ou ainda não postado.' });
        }

        // Formata para o padrão do nosso frontend
        const formattedData = {
            code: trackingInfo.tracking || code,
            carrier: trackingInfo.company?.name || 'Transportadora',
            status: trackingInfo.status || 'Em processamento',
            lastUpdate: trackingInfo.updated_at ? new Date(trackingInfo.updated_at).toLocaleString('pt-BR') : 'Sem dados',
            events: (trackingInfo.events || []).map(ev => ({
                date: new Date(ev.created_at).toLocaleDateString('pt-BR'),
                time: new Date(ev.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                location: ev.location || 'Local não informado',
                status: ev.status,
                description: ev.description
            })).reverse()
        };

        res.json(formattedData);

    } catch (error) {
        console.error('Erro ao rastrear:', error);
        res.status(500).json({ error: 'Erro interno ao processar rastreio.' });
    }
});

function getTestTrackingData(code) {
    return {
        code: code,
        carrier: 'Eleven Logística',
        status: 'EM ROTA DE ENTREGA',
        lastUpdate: new Date().toLocaleString('pt-BR'),
        serviceType: 'Entrega Expressa Eleven',
        events: [
            {
                date: new Date().toLocaleDateString('pt-BR'),
                time: '08:15',
                location: 'Unidade de Distribuição - São Paulo/SP',
                status: 'EM ROTA DE ENTREGA',
                description: 'O entregador já saiu da unidade. Prepare-se para receber seu pacote!',
            },
            {
                date: '07/02/2026',
                time: '19:40',
                location: 'CTE CAJAMAR - CAJAMAR/SP',
                status: 'OBJETO ENCAMINHADO',
                description: 'Carga em trânsito para a unidade de destino final.',
            },
            {
                date: '06/02/2026',
                time: '14:20',
                location: 'Eleven Auto Parts - Matriz',
                status: 'OBJETOS POSTADOS',
                description: 'Sua palheta foi conferida, embalada e entregue à transportadora.',
            }
        ]
    };
}

module.exports = router;
