-- Create conectores table (standalone, no changes to existing tables)
CREATE TABLE IF NOT EXISTS public.conectores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) UNIQUE NOT NULL, -- GA, K4, PB, etc.
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  imagem_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.conectores ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Conectores are viewable by everyone" ON public.conectores
  FOR SELECT USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_conectores_codigo ON public.conectores(codigo);

-- Insert all connector types with their images
INSERT INTO public.conectores (codigo, nome, imagem_url, descricao) VALUES
  ('GA', 'Conector GA', '/assets/conectores/GA.png', 'Conector tipo gancho padrão'),
  ('K4', 'Conector K4', '/assets/conectores/K4.png', 'Conector tipo K4'),
  ('K6', 'Conector K6', '/assets/conectores/K6.png', 'Conector tipo K6'),
  ('K7', 'Conector K7', '/assets/conectores/K7.png', 'Conector tipo K7'),
  ('K9', 'Conector K9', '/assets/conectores/K9.png', 'Conector tipo K9'),
  ('K13', 'Conector K13', '/assets/conectores/K13.png', 'Conector tipo K13'),
  ('K14', 'Conector K14', '/assets/conectores/K14.png', 'Conector tipo K14'),
  ('K15', 'Conector K15', '/assets/conectores/K15.png', 'Conector tipo K15'),
  ('K16', 'Conector K16', '/assets/conectores/K16.png', 'Conector tipo K16'),
  ('K17', 'Conector K17', '/assets/conectores/K17.png', 'Conector tipo K17'),
  ('K19', 'Conector K19', '/assets/conectores/K19.png', 'Conector tipo K19'),
  ('PB', 'Conector PB', '/assets/conectores/PB.png', 'Conector tipo push button'),
  ('PB5', 'Conector PB5', '/assets/conectores/PB5.png', 'Conector tipo push button 5'),
  ('PC', 'Conector PC', '/assets/conectores/PC.png', 'Conector tipo PC'),
  ('PD', 'Conector PD', '/assets/conectores/PD.png', 'Conector tipo PD'),
  ('PF', 'Conector PF', '/assets/conectores/PF.png', 'Conector tipo PF'),
  ('PG', 'Conector PG', '/assets/conectores/PG.png', 'Conector tipo PG'),
  ('PI', 'Conector PI', '/assets/conectores/PI.png', 'Conector tipo PI'),
  ('PM', 'Conector PM', '/assets/conectores/PM.png', 'Conector tipo PM')
ON CONFLICT (codigo) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conectores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conectores_updated_at 
  BEFORE UPDATE ON public.conectores
  FOR EACH ROW 
  EXECUTE FUNCTION update_conectores_updated_at();
