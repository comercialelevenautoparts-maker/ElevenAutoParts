const express = require('express');
const router = express.Router();
const BlingController = require('../controllers/BlingController');

// Auth routes
router.get('/auth', BlingController.auth);
router.get('/callback', BlingController.callback);

// API routes
router.get('/status', BlingController.getStatus);
router.get('/test-connection', BlingController.testConnection);
router.get('/test-create-product', BlingController.testCreateProduct);
router.post('/nfe/:pedidoId', BlingController.emitNfe);

module.exports = router;
