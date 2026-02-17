const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // Usando cliente com chave de serviço para Admin

// Middleware simples para verificar admin
const verifyAdmin = async (req, res, next) => {
    const userId = req.headers['x-user-id']; // Frontend deve enviar o ID do usuário logado
    if (!userId) {
        // Fallback: Tentar pegar do token de autorização se o header explícito não vier
        // Simplificado para este MVP: Exige x-user-id
        return res.status(401).json({ error: 'ID de usuário não fornecido.' });
    }

    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .maybeSingle();

        if (error || !data) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao verificar permissões' });
    }
};

router.patch('/:id/rastreio', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { codigo_rastreio } = req.body;


    if (!codigo_rastreio) {
        return res.status(400).json({ error: 'Código de rastreio obrigatório' });
    }

    try {
        const { data, error } = await supabase
            .from('pedidos')
            .update({
                codigo_rastreio: codigo_rastreio,
                status: 'enviado', // Atualiza status automaticamente ao postar rastreio
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, message: 'Rastreio atualizado com sucesso', data });
    } catch (error) {
        console.error('Erro ao atualizar rastreio:', error);
        res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
});

module.exports = router;
