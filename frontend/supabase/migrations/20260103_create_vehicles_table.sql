-- Create vehicles table for compatibility data
CREATE TABLE IF NOT EXISTS public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INTEGER NOT NULL,
  conector VARCHAR(50),
  tamanho_motorista NUMERIC(4,1),
  tamanho_passageiro NUMERIC(4,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(marca, modelo, ano)
);

-- Enable RLS
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Vehicles are viewable by everyone" ON public.veiculos
  FOR SELECT USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_veiculos_marca ON public.veiculos(marca);
CREATE INDEX idx_veiculos_modelo ON public.veiculos(modelo);
CREATE INDEX idx_veiculos_ano ON public.veiculos(ano);
CREATE INDEX idx_veiculos_marca_modelo ON public.veiculos(marca, modelo);
CREATE INDEX idx_veiculos_marca_modelo_ano ON public.veiculos(marca, modelo, ano);
