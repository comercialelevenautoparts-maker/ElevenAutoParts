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
        p.id,
        p.nome,
        p.descricao,
        p.preco,
        p.estoque,
        p.imagem_principal,
        p.imagens,
        COALESCE(json_agg(pc.categoria) FILTER (WHERE pc.categoria IS NOT NULL), '[]') as categorias
      FROM produtos p
      LEFT JOIN produto_categoria pc ON p.id = pc.id_produto
      WHERE p.ativo = TRUE
    `;

    const conditions = [];

    // ... (rest of filtering logic, adjust fields if needed)

    if (categoria) {
      conditions.push(sql`pc.categoria = ${categoria}`);
    }
    if (search) {
      conditions.push(sql`p.nome ILIKE ${'%' + search + '%'}`);
    }

    if (conditions.length > 0) {
      query = sql`${query} AND (${conditions[0]}${conditions.slice(1).map(c => sql` OR ${c}`)})`;
    }

    query = sql`${query} GROUP BY p.id ORDER BY p.nome`;

    const produtos = await query;

    // Formata resposta sem precisar buscar imagens em outra tabela
    const data = produtos.map(p => ({
      ...p,
      imagens: p.imagens || (p.imagem_principal ? [p.imagem_principal] : [])
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
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
      FROM produtos p
      LEFT JOIN produto_categoria pc ON p.id = pc.id_produto
      WHERE p.id = ${id} AND p.ativo = TRUE
      GROUP BY p.id
    `;

    if (!produto) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...produto,
        // Garante que existe o array, mesmo que vazio
        imagens: produto.imagens || (produto.imagem_principal ? [produto.imagem_principal] : [])
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router;