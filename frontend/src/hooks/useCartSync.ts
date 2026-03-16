import { useEffect, useRef } from 'react';
import { useCart, CartItem } from './useCart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useCartSync = () => {
    const { items, clearCart, addToCart, setItems } = useCart();
    const { user } = useAuth();
    const isInitialMount = useRef(true);
    const isSyncingFromDb = useRef(false);
    const lastLoadedUserId = useRef<string | null>(null);

    // Load from DB on login or refresh
    useEffect(() => {
        const loadCartFromDb = async () => {
            if (!user) {
                lastLoadedUserId.current = null;
                return;
            }

            // Evita carregar múltiplas vezes para o mesmo usuário se já carregamos nesta sessão do componente
            if (lastLoadedUserId.current === user.id) return;

            isSyncingFromDb.current = true;

            try {
                // Find user's cart
                const { data: cartData, error: cartError } = await supabase
                    .from('carrinhos')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle(); // Usar maybeSingle para evitar erro 406/404 se não existir

                let cartId = cartData?.id;

                if (!cartId && !cartError) {
                    const { data: newCart, error: insertError } = await supabase
                        .from('carrinhos')
                        .insert({ user_id: user.id })
                        .select()
                        .maybeSingle();
                    cartId = newCart?.id;
                }

                if (cartId) {
                    // Get items from DB
                    const { data: dbItems } = await supabase
                        .from('carrinho_itens')
                        .select('*, produtos(*)')
                        .eq('carrinho_id', cartId);

                    if (dbItems) {
                        const mappedDbItems: CartItem[] = dbItems.map((dbItem) => {
                            const product = dbItem.produtos as any;
                            return {
                                id: dbItem.produto_id,
                                name: product?.nome || 'Produto',
                                price: dbItem.preco_unitario,
                                image: product?.imagem_principal || '',
                                size: dbItem.tamanho || undefined,
                                metadata: dbItem.metadata as Record<string, any> || undefined,
                                quantity: dbItem.quantidade
                            };
                        });

                        // LÓGICA DE MERGE:
                        // Se temos itens locais (convidado) e acabamos de logar (!lastLoadedUserId)
                        if (items.length > 0 && !lastLoadedUserId.current) {
                            console.log('useCartSync: Mesclando carrinho local com o banco de dados...');
                            
                            // Cria um mapa para facilitar a busca por duplicados (ID + Tamanho)
                            const mergedItems: CartItem[] = [...mappedDbItems];
                            
                            items.forEach(localItem => {
                                const findIndex = mergedItems.findIndex(dbItem => 
                                    dbItem.id === localItem.id && dbItem.size === localItem.size
                                );
                                
                                if (findIndex > -1) {
                                    // Se já existe no banco, somamos a quantidade (opcional, ou podemos manter a do banco)
                                    mergedItems[findIndex].quantity += localItem.quantity;
                                } else {
                                    // Se não existe, adicionamos o novo item
                                    mergedItems.push(localItem);
                                }
                            });
                            
                            setItems(mergedItems);
                        } else {
                            // Se não há o que mesclar ou já estamos sincronizados, apenas carrega do banco
                            setItems(mappedDbItems);
                        }
                    }
                }

                lastLoadedUserId.current = user.id;
            } catch (error) {
                console.error('Error syncing cart from DB:', error);
            } finally {
                isSyncingFromDb.current = false;
                isInitialMount.current = false;
            }
        };

        loadCartFromDb();
    }, [user?.id]); // Depende apenas do ID para estabilidade

    // Sync to DB on local change
    useEffect(() => {
        // Não sincroniza no primeiro mount ou se estamos carregando do DB
        if (isInitialMount.current || isSyncingFromDb.current || !user) return;

        const syncToDb = async () => {
            try {
                const { data: cartData } = await supabase
                    .from('carrinhos')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                let cartId = cartData?.id;
                if (!cartId) {
                    const { data: newCart } = await supabase
                        .from('carrinhos')
                        .insert({ user_id: user.id })
                        .select()
                        .single();
                    cartId = newCart?.id;
                }

                if (cartId) {
                    // Atualização atômica simplificada: deleta tudo e insere o novo estado
                    await supabase.from('carrinho_itens').delete().eq('carrinho_id', cartId);

                    if (items.length > 0) {
                        const itemsToInsert = items.map(item => ({
                            carrinho_id: cartId,
                            produto_id: item.id,
                            quantidade: item.quantity,
                            preco_unitario: item.price,
                            tamanho: item.size || null,
                            metadata: item.metadata || null
                        }));
                        await supabase.from('carrinho_itens').insert(itemsToInsert);
                    }
                }
            } catch (error) {
                console.error('Error syncing cart to DB:', error);
            }
        };

        const timeoutId = setTimeout(syncToDb, 1500); // Debounce um pouco maior
        return () => clearTimeout(timeoutId);
    }, [items, user?.id]);
};
