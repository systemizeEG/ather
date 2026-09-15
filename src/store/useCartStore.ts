import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  image: string | null;
  price: number;
  comparePrice?: number | null;
  categoryName?: string | null;
};

export type CartPackage = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  compareAtPrice?: number | null;
};

export interface CartItem {
  lineId: string;
  product: CartProduct;
  quantity: number;
  packageId: string | null;
  packageName: string | null;
  packageQuantity: number | null;
  unitPrice: number;
}

interface CartState {
  items: CartItem[];
  appliedDiscount: {
    code: string;
    percentage: number;
  } | null;
  addItem: (product: CartProduct, quantity?: number, pkg?: CartPackage | null) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  setAppliedDiscount: (discount: { code: string; percentage: number } | null) => void;
  getCartTotal: () => number;
  getDiscountAmount: () => number;
  getTotalAfterDiscount: () => number;
  getCartCount: () => number;
}

function toCartProduct(product: CartProduct & { category?: string | { name?: string } | null }): CartProduct {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription ?? null,
    image: product.image ?? null,
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    categoryName:
      product.categoryName ??
      (typeof product.category === "string" ? product.category : product.category?.name) ??
      null,
  };
}

function getLineId(productId: string, packageId?: string | null) {
  return `${productId}:${packageId || "single"}`;
}

function getUnitPrice(item: CartItem) {
  return item.unitPrice ?? item.product?.price ?? 0;
}

function getItemLineId(item: CartItem) {
  return item.lineId || getLineId(item.product.id, item.packageId);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDiscount: null,

      addItem: (product, quantity = 1, pkg = null) => {
        const cartProduct = toCartProduct(product);
        const packageId = pkg?.id ?? null;
        const lineId = getLineId(cartProduct.id, packageId);
        const unitPrice = pkg ? pkg.price : cartProduct.price;

        set((state) => {
          const existingItem = state.items.find((item) => getItemLineId(item) === lineId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                getItemLineId(item) === lineId
                  ? { ...item, quantity: item.quantity + quantity, unitPrice, lineId }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                lineId,
                product: cartProduct,
                quantity,
                packageId,
                packageName: pkg?.name ?? null,
                packageQuantity: pkg?.quantity ?? null,
                unitPrice,
              },
            ],
          };
        });
      },

      removeItem: (lineId) => {
        set((state) => ({
          items: state.items.filter((item) => getItemLineId(item) !== lineId),
        }));
      },

      updateQuantity: (lineId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            getItemLineId(item) === lineId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedDiscount: null }),

      setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + getUnitPrice(item) * item.quantity,
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
