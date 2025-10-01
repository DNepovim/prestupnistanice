import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  slug: string;
  count: number;
}

interface CartStorage {
  items: CartItem[];
  _hasHydrated: boolean;
  addToCart: (slug: string) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, count: number) => void;
  emptyCart: () => void;
  getTotalItems: () => number;
  getItemCount: (slug: string) => number;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartStorage>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      addToCart: (slug) =>
        set(({ items }) => {
          const existingItem = items.find((item) => item.slug === slug);
          if (existingItem) {
            return {
              items: items.map((item) =>
                item.slug === slug ? { ...item, count: item.count + 1 } : item,
              ),
            };
          }
          return { items: [...items, { slug, count: 1 }] };
        }),
      removeFromCart: (slug) =>
        set(({ items }) => ({
          items: items.filter((item) => item.slug !== slug),
        })),
      updateQuantity: (slug, count) =>
        set(({ items }) => ({
          items:
            count <= 0
              ? items.filter((item) => item.slug !== slug)
              : items.map((item) =>
                  item.slug === slug ? { ...item, count } : item,
                ),
        })),
      emptyCart: () => set({ items: [] }),
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.count, 0);
      },
      getItemCount: (slug) => {
        const { items } = get();
        const item = items.find((item) => item.slug === slug);
        return item ? item.count : 0;
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
