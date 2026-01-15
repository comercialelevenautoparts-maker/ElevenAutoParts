/**
 * Hook para buscar produtos da Stripe sincronizados com Supabase
 * Usa a tabela 'produtos' existente do banco de dados
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StripeProduto {
    id: string;
    nome: string;
    descricao: string | null;
    preco: number;
    preco_promocional: number | null;
    sku: string;
    imagem_principal: string | null;
    estoque: number;
    ativo: boolean;
    stripe_product_id: string | null;
    stripe_price_id: string | null;
    marca: string | null;
    carro: string | null;
    conectores: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Busca todos os produtos ativos com Stripe configurado
 */
export function useStripeProdutos(categoria?: string) {
    return useQuery({
        queryKey: ['stripe-produtos', categoria],
        queryFn: async () => {
            let query: any = supabase
                .from('produtos')
                .select('*')
                .eq('ativo', true)
                .not('stripe_price_id', 'is', null) // Apenas produtos com Stripe
                .order('created_at', { ascending: false });

            // Filtrar por categoria se fornecida
            if (categoria && categoria !== 'todos') {
                // Assumindo que você tem uma relação com categorias
                // Ajuste conforme sua estrutura
                query = query.eq('categoria_id', categoria);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Erro ao buscar produtos:', error);
                throw error;
            }

            return data as StripeProduto[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

/**
 * Busca um produto específico por ID
 */
export function useStripeProduto(produtoId: string) {
    return useQuery({
        queryKey: ['stripe-produto', produtoId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id', produtoId)
                .single();

            if (error) {
                console.error('Erro ao buscar produto:', error);
                throw error;
            }

            return data as StripeProduto;
        },
        enabled: !!produtoId,
    });
}

/**
 * Busca produtos por SKU
 */
export function useProdutosBySKU(skuPattern: string) {
    return useQuery({
        queryKey: ['produtos-by-sku', skuPattern],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .like('sku', `${skuPattern}%`)
                .eq('ativo', true)
                .not('stripe_price_id', 'is', null);

            if (error) {
                console.error('Erro ao buscar produtos por SKU:', error);
                throw error;
            }

            return data as StripeProduto[];
        },
        enabled: !!skuPattern,
    });
}

/**
 * Busca produtos por marca
 */
export function useProdutosByMarca(marca: string) {
    return useQuery({
        queryKey: ['produtos-by-marca', marca],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('marca', marca)
                .eq('ativo', true)
                .not('stripe_price_id', 'is', null)
                .order('nome');

            if (error) {
                console.error('Erro ao buscar produtos por marca:', error);
                throw error;
            }

            return data as StripeProduto[];
        },
        enabled: !!marca,
    });
}

/**
 * Formata preço em BRL
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);
}

/**
 * Calcula preço com desconto se houver promoção
 */
export function getPrecoFinal(produto: StripeProduto): number {
    return produto.preco_promocional && produto.preco_promocional < produto.preco
        ? produto.preco_promocional
        : produto.preco;
}

/**
 * Verifica se produto está em promoção
 */
export function isEmPromocao(produto: StripeProduto): boolean {
    return !!(
        produto.preco_promocional &&
        produto.preco_promocional < produto.preco
    );
}

/**
 * Calcula percentual de desconto
 */
export function getPercentualDesconto(produto: StripeProduto): number {
    if (!isEmPromocao(produto)) return 0;

    const desconto = produto.preco - (produto.preco_promocional || 0);
    return Math.round((desconto / produto.preco) * 100);
}
