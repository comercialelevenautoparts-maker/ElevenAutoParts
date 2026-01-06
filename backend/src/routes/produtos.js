// src/routes/produtos.js
const express = require('express');
const router = express.Router();
const sql = require('../config/database');

// GET: Listar produtos com filtro por categoria
router.get('/', async (req, res) => {
  const { categoria, search } = req.query;

  try {
    let query = sql`
      SELECT 
        p.id_produto,
        p.nome,
        p.descricao,
        p.preco,
        p.estoque,
        COALESCE(json_agg(pc.categoria) FILTER (WHERE pc.categoria IS NOT NULL), '[]') as categorias
      FROM produto p
      LEFT JOIN produto_categoria pc ON p.id_produto = pc.id_produto
      WHERE p.ativo = TRUE
    `;

    const conditions = [];
    const params = [];

    if (categoria) {
      conditions.push(sql`pc.categoria = ${categoria}`);
    }
    if (search) {
      conditions.push(sql`p.nome ILIKE ${'%' + search + '%'}`);
    }

    if (conditions.length > 0) {
      query = sql`${query} AND (${conditions[0]}${conditions.slice(1).map(c => sql` OR ${c}`)})`;
    }

    query = sql`${query} GROUP BY p.id_produto ORDER BY p.nome`;

    const produtos = await query;

    // Adiciona URLs de imagem para cada produto
    const produtosComImagens = await Promise.all(produtos.map(async (produto) => {
      const imagens = await sql`
        SELECT imagem_url FROM imagem_produto WHERE id_produto = ${produto.id_produto}
      `;
      return {
        ...produto,
        imagem_url: imagens[0]?.imagem_url || null,
        imagens: imagens.map(i => i.imagem_url)
      };
    }));

    res.status(200).json({
      success: true,
      count: produtosComImagens.length,
      data: produtosComImagens
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET: Detalhe do produto
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [produto] = await sql`
      SELECT 
        p.*,
        COALESCE(json_agg(pc.categoria) FILTER (WHERE pc.categoria IS NOT NULL), '[]') as categorias
      FROM produto p
      LEFT JOIN produto_categoria pc ON p.id_produto = pc.id_produto
      WHERE p.id_produto = ${id} AND p.ativo = TRUE
      GROUP BY p.id_produto
    `;

    if (!produto) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    const imagens = await sql`
      SELECT imagem_url FROM imagem_produto WHERE id_produto = ${id}
    `;

    res.status(200).json({
      success: true,
      data: {
        ...produto,
        imagens: imagens.map(i => i.imagem_url)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router;