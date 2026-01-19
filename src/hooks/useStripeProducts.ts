/**
 * Hook para buscar produtos da Stripe sincronizados com Supabase
 * Tabela correta: 'produtos' (português)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StripeProduct {
    id: string;
    stripe_product_id: string | null;
    stripe_price_id: string | null;
    name: string;
    description: string | null;
    price: number;
    price_promotional: number | null;
    image: string | null;
    category: string | null;
    sku: string | null;
    stock_quantity: number;
    active: boolean;
    created_at: string;
    updated_at: string;
    produto_tamanhos?: any[];
    produto_imagens?: any[];
}

/**
 * Busca todos os produtos ativos com Stripe configurado
 */
export function useStripeProducts(category?: string) {
    return useQuery({
        queryKey: ['stripe-products', category],
        queryFn: async () => {
            // Usando any para evitar erros de tipagem excessiva do Supabase
            let query: any = supabase
                .from('produtos')
                .select('*')
                .eq('ativo', true)
                .not('stripe_price_id', 'is', null) // Apenas produtos com Stripe
                .order('created_at', { ascending: false });

            // Aplicar filtro de categoria se não for 'todos'
            if (category && category !== 'todos') {
                // Filtra pelo nome do produto contendo a categoria (Palheta ou Borracha)
                // Usamos ILIKE para busca case-insensitive
                query = query.ilike('nome', `%${category}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Erro ao buscar produtos:', error);
                throw error;
            }

            // Mapear campos do banco (PT) para interface (EN)
            return (data as any[]).map((p) => ({
                id: p.id,
                stripe_product_id: p.stripe_product_id,
                stripe_price_id: p.stripe_price_id,
                name: p.nome,
                description: p.descricao,
                price: p.preco,
                price_promotional: p.preco_promocional,
                image: p.imagem_principal,
                category: p.marca, // Usando marca como categoria provisória ou ajustar
                sku: p.sku,
                stock_quantity: p.estoque,
                active: p.ativo,
                created_at: p.created_at,
                updated_at: p.updated_at || p.created_at,
            })) as StripeProduct[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

/**
 * Busca um produto específico por ID
 */
export function useStripeProduct(productId: string) {
    return useQuery({
        queryKey: ['stripe-product', productId],
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

            if (error) {
                console.error('Erro ao buscar produto:', error);
                throw error;
            }

            const p = data as any;
            return {
                id: p.id,
                stripe_product_id: p.stripe_product_id,
                stripe_price_id: p.stripe_price_id,
                name: p.nome,
                description: p.descricao,
                price: p.preco,
                price_promotional: p.preco_promocional,
                image: p.imagem_principal,
                category: p.marca,
                sku: p.sku,
                stock_quantity: p.estoque,
                active: p.ativo,
                created_at: p.created_at,
                updated_at: p.updated_at || p.created_at,
                produto_tamanhos: p.produto_tamanhos,
                produto_imagens: p.produto_imagens,
            } as StripeProduct;
        },
        enabled: !!productId,
    });
}

/**
 * Busca categorias disponíveis (Baseado em Marca ou ajustável)
 */
export function useProductCategories() {
    return useQuery({
        queryKey: ['product-categories'],
        queryFn: async () => {
            return [
                { id: 'todos', label: 'Todos' },
                { id: 'palheta', label: 'Palheta' },
                { id: 'borracha', label: 'Borracha' },
            ];
        },
        staleTime: 1000 * 60 * 60, // 1 hora já que é estático
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
