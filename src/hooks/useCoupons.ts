import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCoupon = (codigo: string) => {
    return useQuery({
        queryKey: ['coupon', codigo],
        queryFn: async () => {
            if (!codigo) return null;

            const { data, error } = await supabase
                .from('cupons')
                .select('*')
                .eq('codigo', codigo.toUpperCase())
                .eq('ativo', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            // Check dates
            const now = new Date();
            const start = new Date(data.data_inicio);
            const end = new Date(data.data_fim);

            if (now < start || now > end) {
                throw new Error('Cupom expirado ou ainda não disponível.');
            }

            // Check quantity
            if (data.quantidade_total !== null && data.quantidade_usada >= data.quantidade_total) {
                throw new Error('Este cupom atingiu o limite de usos.');
            }

            return data;
        },
        enabled: !!codigo,
        retry: false,
    });
};
