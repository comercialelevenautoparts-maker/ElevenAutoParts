// src/index.js
require('dotenv').config();
const express = require('express');

// === ROTAS ===
const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');
const reviewsRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 3000;

// === WEBHOOKS STRIPE (Antes do JSON global para validação de assinatura) ===
const stripeWebhooksRoutes = require('./routes/stripe-webhooks');
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhooksRoutes);

app.use(express.json());
const cors = require('cors');
app.use(cors());

// === ROTAS DA API ===
app.use('/auth', authRoutes);           // Registro, login, verificação
app.use('/api/produtos', produtosRoutes); // Listagem e detalhe de produtos
app.use('/api/carrinho', carrinhoRoutes); // Carrinho do usuário (protegido)
const freteRoutes = require('./routes/frete');
app.use('/api/frete', freteRoutes); // Cálculo de frete

// === ROTAS STRIPE ===
const stripeRoutes = require('./routes/stripe');
app.use('/api', stripeRoutes); // Ex: /api/create-checkout-session
app.use('/api/reviews', reviewsRoutes); // Sincronização de depoimentos do Google


// === HEALTH CHECK ===
app.get('/', (req, res) => {
  res.json({
    message: 'ElevenAutoParts API - OK',
    version: '1.0.0',
    endpoints: {
      auth: '/auth/*',
      produtos: '/api/produtos',
      carrinho: '/api/carrinho',
      stripe_checkout: '/api/create-checkout-session'
    }
  });
});

// === 404 - Rota não encontrada ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// === INICIALIZAÇÃO DO SERVIDOR ===
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}`);
  });
}

module.exports = app;