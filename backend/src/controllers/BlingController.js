const BlingService = require('../services/BlingService');

class BlingController {
    async auth(req, res) {
        try {
            const url = BlingService.getAuthorizationUrl();
            res.redirect(url);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async callback(req, res) {
        const { code } = req.query;
        if (!code) {
            return res.status(400).send('No code provided');
        }

        try {
            await BlingService.exchangeCodeForToken(code);
            // Redirect back to frontend admin page
            // Assuming frontend is running on localhost:5173 or similar. 
            // Ideally should be an env var FRONTEND_URL
            res.redirect('http://localhost:8080/admin/bling?status=success');
        } catch (error) {
            console.error(error);
            res.redirect('http://localhost:8080/admin/bling?status=error');
        }
    }

    async getStatus(req, res) {
        try {
            const status = await BlingService.getStatus();
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async emitNfe(req, res) {
        const { pedidoId } = req.params;
        try {
            const result = await BlingService.createNFeForOrder(pedidoId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async testConnection(req, res) {
        try {
            const data = await BlingService.getProducts();
            res.json({
                message: 'Conexão com Bling V3 estabelecida com sucesso!',
                data: data
            });
        } catch (error) {
            console.error('Bling Test Error:', error.response?.data || error.message);
            res.status(500).json({
                error: 'Falha na conexão com Bling',
                details: error.response?.data || error.message
            });
        }
    }

    async testCreateProduct(req, res) {
        try {
            const dummyProduct = {
                nome: "Produto Teste Eleven - " + new Date().getTime(),
                codigo: "TESTE-" + Math.floor(Math.random() * 1000),
                preco: 10.50,
                tipo: "P",
                situacao: "A",
                formato: "S"
            };
            const result = await BlingService.createProduct(dummyProduct);
            res.json({
                message: 'Produto de teste criado no Bling!',
                result: result
            });
        } catch (error) {
            res.status(500).json({
                error: 'Falha ao criar produto de teste',
                details: error.response?.data || error.message
            });
        }
    }
}

module.exports = new BlingController();
