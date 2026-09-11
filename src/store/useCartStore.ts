import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@prisma/client";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  appliedDiscount: {
    code: string;
    percentage: number;
  } | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: String) => void;
  updateQuantity: (productId: String, quantity: number) => void;
  clearCart: () => void;
  setAppliedDiscount: (discount: { code: string; percentage: number } | null) => void;
  getCartTotal: () => number;
  getDiscountAmount: () => number;
  getTotalAfterDiscount: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDiscount: null,
      
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId: String) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: String, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedDiscount: null }),

      setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getDiscountAmount: () => {
        const total = get().getCartTotal();
        const discount = get().appliedDiscount;
        if (!discount) return 0;
        return (total * discount.percentage) / 100;
      },

      getTotalAfterDiscount: () => {
        return get().getCartTotal() - get().getDiscountAmount();
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "ecommerce-cart-storage",
    }
  )
);
