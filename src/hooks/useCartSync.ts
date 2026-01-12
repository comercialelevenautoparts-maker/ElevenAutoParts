import { useEffect, useRef } from 'react';
import { useCart } from './useCart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useCartSync = () => {
    const { items, clearCart, addToCart } = useCart();
    const { user } = useAuth();
    const isInitialMount = useRef(true);
    const isSyncingFromDb = useRef(false);

    // Load from DB on login
    useEffect(() => {
        const loadCartFromDb = async () => {
            if (!user) return;

            isSyncingFromDb.current = true;

            try {
                // Find user's cart
                const { data: cartData } = await supabase
                    .from('carrinhos')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                let cartId = cartData?.id;

                if (!cartId) {
                    // Create cart if not exists
                    const { data: newCart } = await supabase
                        .from('carrinhos')
                        .insert({ user_id: user.id })
                        .select()
                        .single();
                    cartId = newCart?.id;
                }

                if (cartId) {
                    // Get items
                    const { data: dbItems } = await supabase
                        .from('carrinho_itens')
                        .select('*, produtos(*)')
                        .eq('carrinho_id', cartId);

                    if (dbItems && dbItems.length > 0) {
                        // If DB has items, we might want to merge or prioritize.
                        // For simplicity, if DB has items, we overwrite local (premium/cloud-first feel)
                        // or just add them if not present.
                        dbItems.forEach((dbItem) => {
                            const product = dbItem.produtos as any;
                            addToCart({
                                id: dbItem.produto_id,
                                name: product?.nome || 'Produto',
                                price: dbItem.preco_unitario,
                                image: product?.imagem_principal || '',
                                size: dbItem.tamanho || undefined,
                            }, dbItem.quantidade);
                        });
                    }
                }
            } catch (error) {
                console.error('Error syncing cart from DB:', error);
            } finally {
                isSyncingFromDb.current = false;
                isInitialMount.current = false;
            }
        };

        loadCartFromDb();
    }, [user]);

    // Sync to DB on local change
    useEffect(() => {
        if (isInitialMount.current || isSyncingFromDb.current || !user) return;

        const syncToDb = async () => {
            try {
                // 1. Get or create cart
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
                    // 2. Clear current items in DB for this cart
                    await supabase.from('carrinho_itens').delete().eq('carrinho_id', cartId);

                    // 3. Insert current local items
                    if (items.length > 0) {
                        const itemsToInsert = items.map(item => ({
                            carrinho_id: cartId,
                            produto_id: item.id,
                            quantidade: item.quantity,
                            preco_unitario: item.price,
                            tamanho: item.size || null
                        }));
                        await supabase.from('carrinho_itens').insert(itemsToInsert);
                    }
                }
            } catch (error) {
                console.error('Error syncing cart to DB:', error);
            }
        };

        const timeoutId = setTimeout(syncToDb, 1000); // Debounce sync
        return () => clearTimeout(timeoutId);
    }, [items, user]);
};
