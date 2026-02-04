-- Adicionar coluna metadata para carrinho_itens e pedido_itens
ALTER TABLE public.carrinho_itens ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Comentários para documentação
COMMENT ON COLUMN public.carrinho_itens.metadata IS 'Metadados adicionais do item no carrinho, como informações do veículo (marca, modelo, ano, conector).';
COMMENT ON COLUMN public.pedido_itens.metadata IS 'Metadados adicionais do item no pedido, como informações do veículo (marca, modelo, ano, conector).';
