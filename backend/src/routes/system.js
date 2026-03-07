const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * @route   GET /api/system/heartbeat
 * @desc    Registra uma atividade no banco de dados para evitar que o Supabase pause por inatividade.
 * @access  Public (Pode ser protegido com uma API KEY se necessário)
 */
router.get('/heartbeat', async (req, res) => {
    console.log('💓 Heartbeat recebido. Atualizando status do sistema...');
    
    try {
        const now = new Date().toISOString();
        
        // Upsert no registro ID 1 para manter sempre apenas uma linha de status
        const { data, error } = await supabase
            .from('system_status')
            .upsert({ 
                id: 1, 
                last_heartbeat: now,
                service_name: 'ElevenAutoParts-Backend',
                status: 'active'
            }, { onConflict: 'id' });

        if (error) {
            console.error('❌ Erro no Heartbeat do Supabase:', error.message);
            return res.status(500).json({ 
                success: false, 
                error: 'Falha ao comunicar com o banco de dados' 
            });
        }

        console.log('✅ Supabase Heartbeat: Banco de dados atualizado com sucesso em', now);
        
        return res.json({
            success: true,
            message: 'Heartbeat processado com sucesso',
            timestamp: now
        });
    } catch (err) {
        console.error('❌ Erro inesperado no Heartbeat:', err.message);
        return res.status(500).json({ 
            success: false, 
            error: 'Erro interno no processamento do heartbeat' 
        });
    }
});

module.exports = router;
