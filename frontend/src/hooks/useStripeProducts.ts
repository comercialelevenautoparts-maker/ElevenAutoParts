/**
 * Hook para buscar produtos da Stripe sincronizados com Supabase
 * Tabela correta: 'produtos' (português)
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();

    // Listener de tempo real removido temporariamente para depuração pura
    // ...


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
                if (category === 'borracha') {
                    // Para borracha, incluir também "refil"
                    query = query.or('nome.ilike.%borracha%,nome.ilike.%refil%');
                } else {
                    // Filtra pelo nome do produto contendo a categoria (Palheta)
                    // Usamos ILIKE para busca case-insensitive
                    query = query.ilike('nome', `%${category}%`);
                }
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
        queryKey: ['stripe-product-details', productId],
        queryFn: async () => {
            console.log('🔍 useStripeProduct: Buscando produto ID:', productId);
            // First fetch the main product data
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) {
                console.error('❌ useStripeProduct: Erro ao buscar produto:', error);
                throw error;
            }
            console.log('✅ useStripeProduct: Produto encontrado:', data.nome);

            const p = data as any;
            const mainImage = p.imagem_principal;

            // Fetch extra data in parallel, but handle them gracefully if they fail
            const [tamanhosRes, imagensRes] = await Promise.all([
                supabase.from('produto_tamanhos').select('*').eq('produto_id', productId),
                supabase.from('produto_imagens').select('*').eq('produto_id', productId)
            ]);

            // If relation fetch fails, we just use empty array instead of crashing the whole query
            const dbTamanhos = tamanhosRes.data || [];
            const dbImagens = imagensRes.data || [];

            // Estratégia de busca de imagens:
            // 1. Pega da tabela relacionada 'produto_imagens'
            // 2. Pega da coluna array 'imagens' do produto
            // 3. Usa o conjunto que for maior (mais completo)
            const tableImages = dbImagens.map(img => ({ url_imagem: img.url_imagem, principal: img.principal }));
            const arrayImages = (p.imagens || []).map((url: string) => ({
                url_imagem: url,
                principal: url === mainImage
            }));

            let finalImages = arrayImages.length >= tableImages.length ? arrayImages : tableImages;

            // Garante que a imagem principal esteja presente se nada mais for encontrado
            if (finalImages.length === 0 && mainImage) {
                finalImages.push({ url_imagem: mainImage, principal: true });
            }

            return {
                id: p.id,
                stripe_product_id: p.stripe_product_id,
                stripe_price_id: p.stripe_price_id,
                name: p.nome,
                description: p.descricao,
                price: p.preco,
                price_promotional: p.preco_promocional,
                image: mainImage,
                category: p.marca,
                sku: p.sku,
                stock_quantity: p.estoque,
                active: p.ativo,
                created_at: p.created_at,
                updated_at: p.updated_at || p.created_at,
                produto_tamanhos: dbTamanhos,
                produto_imagens: finalImages,
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
