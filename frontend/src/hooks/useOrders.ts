import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pedido, PedidoItem, StatusPedido, Produto, Endereco } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_itens(
            *,
            produto:produtos(*)
          ),
          endereco:enderecos(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as (Pedido & { pedido_itens: (PedidoItem & { produto: Produto })[], endereco: Endereco })[];
    },
    enabled: !!user,
  });
};

export const useOrder = (orderId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_itens(*),
          enderecos(*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as unknown as Pedido & { pedido_itens: PedidoItem[] };
    },
    enabled: !!user && !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderData: {
      endereco_id: string;
      valor_produtos: number;
      valor_frete: number;
      valor_desconto: number;
      valor_total: number;
      forma_pagamento: string;
      tipo_frete?: string;
      status?: StatusPedido;
      itens: {
        produto_id: string;
        nome_produto: string;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
        tamanho?: string;
        metadata?: Record<string, any>;
      }[];
    }) => {
      // Guest orders are allowed
      const numero_pedido = `#${Date.now().toString(36).toUpperCase()}`;

      const orderPayload: any = {
        user_id: user?.id || null,
        endereco_id: orderData.endereco_id,
        numero_pedido,
        valor_produtos: orderData.valor_produtos,
        valor_frete: orderData.valor_frete,
        valor_desconto: orderData.valor_desconto,
        valor_total: orderData.valor_total,
        forma_pagamento: orderData.forma_pagamento,
        tipo_frete: orderData.tipo_frete,
        status: orderData.status || 'pendente',
      };

      const { data: order, error: orderError } = await supabase
        .from('pedidos')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase
        .from('pedido_itens')
        .insert(
          orderData.itens.map((item) => ({
            pedido_id: order.id,
            ...item,
          }))
        );

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
