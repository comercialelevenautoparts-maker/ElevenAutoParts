-- Rename veiculos to veiculos_compativeis for better clarity
ALTER TABLE IF EXISTS public.veiculos RENAME TO veiculos_compativeis;

-- Add conector_id column as foreign key
ALTER TABLE public.veiculos_compativeis 
  ADD COLUMN IF NOT EXISTS conector_id UUID REFERENCES public.conectores(id);

-- Create a temporary mapping to update existing records
-- This updates conector_id based on the conector code
UPDATE public.veiculos_compativeis vc
SET conector_id = c.id
FROM public.conectores c
WHERE vc.conector = c.codigo;

-- Now we can make conector_id NOT NULL since all records should have a valid conector
ALTER TABLE public.veiculos_compativeis 
  ALTER COLUMN conector_id SET NOT NULL;

-- Add index for foreign key
CREATE INDEX IF NOT EXISTS idx_veiculos_conector_id ON public.veiculos_compativeis(conector_id);

-- Optional: Keep the conector column for backward compatibility or remove it
-- If you want to remove it after migration:
-- ALTER TABLE public.veiculos_compativeis DROP COLUMN IF EXISTS conector;

-- Update the unique constraint to use the new structure
ALTER TABLE public.veiculos_compativeis 
  DROP CONSTRAINT IF EXISTS veiculos_marca_modelo_ano_key;

ALTER TABLE public.veiculos_compativeis 
  ADD CONSTRAINT veiculos_compativeis_marca_modelo_ano_key 
  UNIQUE(marca, modelo, ano);

-- Rename indexes to match new table name
DROP INDEX IF EXISTS idx_veiculos_marca;
DROP INDEX IF EXISTS idx_veiculos_modelo;
DROP INDEX IF EXISTS idx_veiculos_ano;
DROP INDEX IF EXISTS idx_veiculos_marca_modelo;
DROP INDEX IF EXISTS idx_veiculos_marca_modelo_ano;

CREATE INDEX IF NOT EXISTS idx_veiculos_compativeis_marca ON public.veiculos_compativeis(marca);
CREATE INDEX IF NOT EXISTS idx_veiculos_compativeis_modelo ON public.veiculos_compativeis(modelo);
CREATE INDEX IF NOT EXISTS idx_veiculos_compativeis_ano ON public.veiculos_compativeis(ano);
CREATE INDEX IF NOT EXISTS idx_veiculos_compativeis_marca_modelo ON public.veiculos_compativeis(marca, modelo);
CREATE INDEX IF NOT EXISTS idx_veiculos_compativeis_marca_modelo_ano ON public.veiculos_compativeis(marca, modelo, ano);

-- Update RLS policies
DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON public.veiculos_compativeis;

CREATE POLICY "Veiculos compativeis are viewable by everyone" ON public.veiculos_compativeis
  FOR SELECT USING (true);
