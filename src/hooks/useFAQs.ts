import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FAQ, Depoimento } from '@/types/database';

export const useFAQs = (category?: string) => {
  return useQuery({
    queryKey: ['faqs', category],
    queryFn: async () => {
      let query = supabase
        .from('faqs')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (category && category !== 'todos') {
        query = query.eq('categoria', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FAQ[];
    },
  });
};

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('depoimentos')
        .select('*')
        .eq('aprovado', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Depoimento[];
    },
  });
};
