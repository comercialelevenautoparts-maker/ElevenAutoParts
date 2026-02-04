import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface FavoriteItem {
  id: string;
  user_id: string;
  produto_id: string;
  created_at: string;
  produto: Tables<'produtos'> & {
    produto_tamanhos: Tables<'produto_tamanhos'>[];
  };
}

interface FavoritesStore {
  favorites: FavoriteItem[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  loadFavorites: () => Promise<void>;
  addFavorite: (produtoId: string) => Promise<void>;
  removeFavorite: (produtoId: string) => Promise<void>;
  isFavorite: (produtoId: string) => boolean;
  toggleFavorite: (produtoId: string) => Promise<void>;
}

export const useFavorites = create<FavoritesStore>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  initialized: false,

  loadFavorites: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false, initialized: true });
        return;
      }

      const { data, error } = await supabase
        .from('lista_desejos')
        .select(`
          id,
          user_id,
          produto_id,
          created_at,
          produto:produtos!lista_desejos_produto_id_fkey(*, produto_tamanhos(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        favorites: data as FavoriteItem[], 
        loading: false, 
        initialized: true 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Erro ao carregar favoritos', 
        loading: false, 
        initialized: true 
      });
    }
  },

  addFavorite: async (produtoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('lista_desejos')
        .select('id')
        .eq('user_id', user.id)
        .eq('produto_id', produtoId)
        .single();

      if (existing) {
        // Already in favorites, just return
        return;
      }

      const { error } = await supabase
        .from('lista_desejos')
        .insert([{ user_id: user.id, produto_id: produtoId }]);

      if (error) throw error;

      // Reload favorites to update the list
      await get().loadFavorites();
    } catch (error: any) {
      set({ error: error.message || 'Erro ao adicionar favorito' });
      throw error;
    }
  },

  removeFavorite: async (produtoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('lista_desejos')
        .delete()
        .eq('user_id', user.id)
        .eq('produto_id', produtoId);

      if (error) throw error;

      // Reload favorites to update the list
      await get().loadFavorites();
    } catch (error: any) {
      set({ error: error.message || 'Erro ao remover favorito' });
      throw error;
    }
  },

  isFavorite: (produtoId: string) => {
    return get().favorites.some(fav => fav.produto_id === produtoId);
  },

  toggleFavorite: async (produtoId: string) => {
    const isFav = get().isFavorite(produtoId);
    if (isFav) {
      await get().removeFavorite(produtoId);
    } else {
      await get().addFavorite(produtoId);
    }
  },
}));