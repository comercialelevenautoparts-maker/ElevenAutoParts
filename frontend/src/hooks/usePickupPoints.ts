import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PickupPoint } from '@/types/database';

export const usePickupPoint = () => {
  return useQuery({
    queryKey: ['pickup-point'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PickupPoint;
    },
  });
};

export const useUpdatePickupPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pickupPoint: Partial<PickupPoint> & { id: string }) => {
      const { data, error } = await supabase
        .from('pickup_points')
        .update(pickupPoint)
        .eq('id', pickupPoint.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-point'] });
    },
  });
};
