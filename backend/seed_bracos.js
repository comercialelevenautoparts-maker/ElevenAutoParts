const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function migrate() {
    console.log('🚀 Iniciando migração da tabela conectores...');

    // 1. Criar a coluna se não existir (via RPC de sistema ou apenas tentando dar o update)
    // Nota: Como não temos acesso direto ao SQL Editor aqui, vamos tentar um truque ou assumir que o usuário pode rodar. 
    // Mas posso tentar rodar um SQL bruto via rpc se houver um configurado, ou apenas avisar.
    // Na verdade, no Supabase client não dá pra rodar DDL (ALTER TABLE) a menos que tenha uma função RPC pra isso.

    console.log('⚠️  Nota: Certifique-se de rodar "ALTER TABLE conectores ADD COLUMN IF NOT EXISTS imagem_braco TEXT;" no painel do Supabase.');

    const bracos = [
        { codigo: 'K14', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529516/18_rxyt1v.png' },
        { codigo: 'K6', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529515/14_o1rjtd.png' },
        { codigo: 'PM', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529515/17_ncyqax.png' },
        { codigo: 'K19', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529515/16_h6mdqg.png' },
        { codigo: 'K17', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529515/15_gfvb4r.png' },
        { codigo: 'K9', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529515/13_seuyn9.png' },
        { codigo: 'K16', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529514/12_jexngp.png' },
        { codigo: 'K13', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529512/11_txpk2a.png' },
        { codigo: 'PB', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529512/9_i6olsx.png' },
        { codigo: 'PD', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529512/10_qgs7ni.png' },
        { codigo: 'K15', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529512/8_wh4brb.png' },
        { codigo: 'K7', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529512/7_g9kk4o.png' },
        { codigo: 'PC', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529512/5_hjtmpi.png' },
        { codigo: 'PI', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529512/6_ulna4m.png' },
        { codigo: 'PF', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529511/4_agu7ce.png' },
        { codigo: 'K4', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529511/3_fzw3pz.png' },
        { codigo: 'PB5', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529511/2_dvn9xd.png' },
        { codigo: 'PG', url: 'https://res.cloudinary.com/dpd3oztsg/image/upload/v1771529511/1_pz4tug.png' }
    ];

    for (const item of bracos) {
        process.stdout.write(`Updating ${item.codigo}... `);
        const { error } = await supabase
            .from('conectores')
            .update({ imagem_braco: item.url })
            .eq('codigo', item.codigo);

        if (error) {
            console.log(`❌ Erro: ${error.message}`);
        } else {
            console.log('✅ OK');
        }
    }

    console.log('\n✨ Migração finalizada!');
}

migrate();
