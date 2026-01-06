import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Endereco } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useAddresses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user.id)
        .order('padrao', { ascending: false });

      if (error) throw error;
      return data as Endereco[];
    },
    enabled: !!user,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (addressData: Omit<Endereco, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('enderecos')
        .insert({
          ...addressData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Endereco> & { id: string }) => {
      const { error } = await supabase
        .from('enderecos')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enderecos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

// Fetch address from CEP API
export const fetchAddressByCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
    };
  } catch {
    return null;
  }
};
