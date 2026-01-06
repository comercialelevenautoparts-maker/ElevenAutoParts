// src/index.js
require('dotenv').config();
const express = require('express');

// === ROTAS ===
const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const cors = require('cors');
app.use(cors());

// === ROTAS DA API ===
app.use('/auth', authRoutes);           // Registro, login, verificação
app.use('/api/produtos', produtosRoutes); // Listagem e detalhe de produtos
app.use('/api/carrinho', carrinhoRoutes); // Carrinho do usuário (protegido)

// === HEALTH CHECK ===
app.get('/', (req, res) => {
  res.json({
    message: 'ElevenAutoParts API - OK',
    version: '1.0.0',
    endpoints: {
      auth: '/auth/*',
      produtos: '/api/produtos',
      carrinho: '/api/carrinho'
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
});