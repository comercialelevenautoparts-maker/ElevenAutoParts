import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  metadata?: Record<string, any>;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) =>
          i.id === item.id &&
          i.size === item.size &&
          JSON.stringify(i.metadata) === JSON.stringify(item.metadata)
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              (i.id === item.id &&
                i.size === item.size &&
                JSON.stringify(i.metadata) === JSON.stringify(item.metadata))
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      addToCart: (item, quantity) => {
        const { items } = get();
        // Check if item with same id, size and metadata already exists
        const existingItem = items.find((i) =>
          i.id === item.id &&
          i.size === item.size &&
          JSON.stringify(i.metadata) === JSON.stringify(item.metadata)
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              (i.id === item.id &&
                i.size === item.size &&
                JSON.stringify(i.metadata) === JSON.stringify(item.metadata))
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'eleven-cart',
    }
  )
);
