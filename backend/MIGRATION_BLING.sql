-- Execute this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL UNIQUE, -- 'bling'
    access_token TEXT,
    refresh_token TEXT,
    expires_in INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add column to orders to store NFe status/link
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS nfe_key TEXT,
ADD COLUMN IF NOT EXISTS nfe_link TEXT,
ADD COLUMN IF NOT EXISTS nfe_status TEXT DEFAULT 'pendente'; -- pendente, emitida, erro
