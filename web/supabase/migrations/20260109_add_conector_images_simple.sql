-- Solução simples: Adicionar coluna imagem_url diretamente na tabela veiculos_compativeis
ALTER TABLE public.veiculos_compativeis 
  ADD COLUMN IF NOT EXISTS conector_imagem_url TEXT;

-- Atualizar a coluna com as URLs das imagens baseado no código do conector
UPDATE public.veiculos_compativeis
SET conector_imagem_url = CASE conector
  WHEN 'GA' THEN '/assets/conectores/GA.png'
  WHEN 'K4' THEN '/assets/conectores/K4.png'
  WHEN 'K6' THEN '/assets/conectores/K6.png'
  WHEN 'K7' THEN '/assets/conectores/K7.png'
  WHEN 'K9' THEN '/assets/conectores/K9.png'
  WHEN 'K13' THEN '/assets/conectores/K13.png'
  WHEN 'K14' THEN '/assets/conectores/K14.png'
  WHEN 'K15' THEN '/assets/conectores/K15.png'
  WHEN 'K16' THEN '/assets/conectores/K16.png'
  WHEN 'K17' THEN '/assets/conectores/K17.png'
  WHEN 'K19' THEN '/assets/conectores/K19.png'
  WHEN 'PB' THEN '/assets/conectores/PB.png'
  WHEN 'PB5' THEN '/assets/conectores/PB5.png'
  WHEN 'PC' THEN '/assets/conectores/PC.png'
  WHEN 'PD' THEN '/assets/conectores/PD.png'
  WHEN 'PF' THEN '/assets/conectores/PF.png'
  WHEN 'PG' THEN '/assets/conectores/PG.png'
  WHEN 'PI' THEN '/assets/conectores/PI.png'
  WHEN 'PM' THEN '/assets/conectores/PM.png'
  ELSE NULL
END;

-- Criar um trigger para atualizar automaticamente a imagem quando o conector mudar
CREATE OR REPLACE FUNCTION update_conector_imagem()
RETURNS TRIGGER AS $$
BEGIN
  NEW.conector_imagem_url = CASE NEW.conector
    WHEN 'GA' THEN '/assets/conectores/GA.png'
    WHEN 'K4' THEN '/assets/conectores/K4.png'
    WHEN 'K6' THEN '/assets/conectores/K6.png'
    WHEN 'K7' THEN '/assets/conectores/K7.png'
    WHEN 'K9' THEN '/assets/conectores/K9.png'
    WHEN 'K13' THEN '/assets/conectores/K13.png'
    WHEN 'K14' THEN '/assets/conectores/K14.png'
    WHEN 'K15' THEN '/assets/conectores/K15.png'
    WHEN 'K16' THEN '/assets/conectores/K16.png'
    WHEN 'K17' THEN '/assets/conectores/K17.png'
    WHEN 'K19' THEN '/assets/conectores/K19.png'
    WHEN 'PB' THEN '/assets/conectores/PB.png'
    WHEN 'PB5' THEN '/assets/conectores/PB5.png'
    WHEN 'PC' THEN '/assets/conectores/PC.png'
    WHEN 'PD' THEN '/assets/conectores/PD.png'
    WHEN 'PF' THEN '/assets/conectores/PF.png'
    WHEN 'PG' THEN '/assets/conectores/PG.png'
    WHEN 'PI' THEN '/assets/conectores/PI.png'
    WHEN 'PM' THEN '/assets/conectores/PM.png'
    ELSE NULL
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_conector_imagem_on_insert_or_update
  BEFORE INSERT OR UPDATE OF conector ON public.veiculos_compativeis
  FOR EACH ROW
  EXECUTE FUNCTION update_conector_imagem();
