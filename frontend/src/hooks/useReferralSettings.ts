import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReferralSettings } from '@/types/database';

export const useReferralSettings = () => {
  return useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      return data as ReferralSettings || {
        id: 'default',
        referrer_bonus_amount: 50,
        referred_discount_percent: 10,
        updated_at: new Date().toISOString()
      };
    },
  });
};

export const useUpdateReferralSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<ReferralSettings> & { id: string }) => {
      const { data, error } = await supabase
        .from('referral_settings')
        .update({
          referrer_bonus_amount: settings.referrer_bonus_amount,
          referred_discount_percent: settings.referred_discount_percent,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-settings'] });
    },
  });
};
