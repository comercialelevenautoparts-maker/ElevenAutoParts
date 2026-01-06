import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Produto, Categoria, ProdutoTamanho } from '@/types/database';

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('produtos')
        .select(`
          *,
          produto_categorias!inner(
            categorias!inner(slug, nome)
          )
        `)
        .eq('ativo', true);

      if (categorySlug && categorySlug !== 'todos') {
        query = query.eq('produto_categorias.categorias.slug', categorySlug);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Produto & { produto_categorias: { categorias: Categoria }[] })[];
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          produto_tamanhos(*),
          produto_imagens(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data as Produto & {
        produto_tamanhos: ProdutoTamanho[];
        produto_imagens: ProdutoImagem[];
      };
    },
    enabled: !!productId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      return data as Categoria[];
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Produto[];
    },
  });
};
