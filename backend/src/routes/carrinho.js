// src/routes/carrinho.js
const express = require('express');
const router = express.Router();
const sql = require('../config/database');
const verifyToken = require('../middleware/verifyToken');

// POST: Adicionar ao carrinho
router.post('/', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { id_produto, quantidade = 1 } = req.body;

  if (!id_produto || quantidade < 1) {
    return res.status(400).json({ success: false, error: 'Dados inválidos' });
  }

  try {
    // Verifica se produto existe e tem estoque
    const [produto] = await sql`SELECT preco, estoque, nome FROM produto WHERE id_produto = ${id_produto} AND ativo = TRUE`;
    if (!produto) return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    if (produto.estoque < quantidade) return res.status(400).json({ success: false, error: 'Estoque insuficiente' });

    // Busca ou cria carrinho
    let [carrinho] = await sql`SELECT id_carrinho FROM carrinho WHERE id_us = ${userId}`;
    if (!carrinho) {
      [carrinho] = await sql`
        INSERT INTO carrinho (id_us) VALUES (${userId}) RETURNING id_carrinho
      `;
    }

    // Adiciona/atualiza item
    const [existing] = await sql`
      SELECT quantidade FROM item_carrinho 
      WHERE id_carrinho = ${carrinho.id_carrinho} AND id_produto = ${id_produto}
    `;

    if (existing) {
      await sql`
        UPDATE item_carrinho 
        SET quantidade = ${existing.quantidade + quantidade}
        WHERE id_carrinho = ${carrinho.id_carrinho} AND id_produto = ${id_produto}
      `;
    } else {
      await sql`
        INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade)
        VALUES (${carrinho.id_carrinho}, ${id_produto}, ${quantidade})
      `;
    }

    res.status(200).json({ success: true, message: 'Adicionado ao carrinho' });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// GET: Listar carrinho
router.get('/', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const [carrinho] = await sql`SELECT id_carrinho FROM carrinho WHERE id_us = ${userId}`;
    if (!carrinho) {
      return res.status(200).json({ success: true, itens: [], total: 0 });
    }

    const itens = await sql`
      SELECT 
        ic.id_produto,
        p.nome,
        p.imagem_url,
        p.preco,
        ic.quantidade,
        (p.preco * ic.quantidade) as subtotal
      FROM item_carrinho ic
      JOIN produto p ON ic.id_produto = p.id_produto
      WHERE ic.id_carrinho = ${carrinho.id_carrinho}
    `;

    const total = itens.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);

    res.status(200).json({
      success: true,
      itens,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    console.error('Erro ao listar carrinho:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// DELETE: Remover item
router.delete('/:id_produto', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { id_produto } = req.params;

  try {
    const [carrinho] = await sql`SELECT id_carrinho FROM carrinho WHERE id_us = ${userId}`;
    if (!carrinho) return res.status(404).json({ success: false, error: 'Carrinho não encontrado' });

    const result = await sql`
      DELETE FROM item_carrinho 
      WHERE id_carrinho = ${carrinho.id_carrinho} AND id_produto = ${id_produto}
      RETURNING id_produto
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Item não encontrado no carrinho' });
    }

    res.status(200).json({ success: true, message: 'Item removido' });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

module.exports = router;