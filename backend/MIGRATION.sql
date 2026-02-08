-- Execute este script no SQL Editor do seu Dashboard Supabase

-- 1. Habilitar a extensão de UUID se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Atualizar a tabela de perfis para suportar indicação
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS saldo_creditos NUMERIC DEFAULT 0;

-- 3. Criar a tabela de histórico de créditos
CREATE TABLE IF NOT EXISTS creditos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    valor NUMERIC NOT NULL,
    id_referencia UUID, -- Geralmente o ID do pedido que gerou o crédito
    descricao TEXT,
    tipo TEXT CHECK (tipo IN ('entrada', 'saida')),
    status TEXT DEFAULT 'disponivel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. (Opcional) Trigger para gerar código de indicação automático no cadastro
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := 'ELEVEN' || UPPER(SUBSTRING(REPLACE(NEW.email, '@', ''), 1, 4)) || floor(random() * 9000 + 1000)::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_referral_code ON profiles;
CREATE TRIGGER tr_generate_referral_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION generate_referral_code();
