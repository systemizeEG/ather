"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";

type PurchasePackage = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  compareAtPrice: number | null;
};

type Option = {
  id: string;
  name: string;
  hint: string;
  price: number;
  comparePrice: number | null;
  pkg: PurchasePackage | null;
};

export function AddToCartButton({
  product,
  packages = [],
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    image: string | null;
    price: number;
    comparePrice: number | null;
    category?: { name: string; slug: string } | null;
  };
  packages?: PurchasePackage[];
}) {
  const [isAdded, setIsAdded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("single");
  const addToCart = useCartStore((state) => state.addItem);

  const options: Option[] = [
    {
      id: "single",
      name: "قطعة واحدة",
      hint: "الخيار العادي",
      price: product.price,
      comparePrice: product.comparePrice,
      pkg: null,
    },
    ...packages.map((pkg) => {
      const regularTotal = product.price * pkg.quantity;
      const saved = Math.max(0, Math.round((pkg.compareAtPrice ?? regularTotal) - pkg.price));
      return {
        id: pkg.id,
        name: pkg.name,
        hint: saved > 0 ? `${pkg.quantity} قطع · وفر ${saved} ج.م` : `${pkg.quantity} قطع`,
        price: pkg.price,
        comparePrice: pkg.compareAtPrice,
        pkg,
      };
    }),
  ];

  const selected = options.find((option) => option.id === selectedId) || options[0];

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        shortDescription: product.shortDescription,
        image: product.image,
        price: product.price,
        comparePrice: product.comparePrice,
        categoryName: product.category?.name,
      },
      1,
      selected.pkg
        ? {
            id: selected.pkg.id,
            name: selected.pkg.name,
            quantity: selected.pkg.quantity,
            price: selected.pkg.price,
            compareAtPrice: selected.pkg.compareAtPrice,
          }
        : null
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="space-y-5">
      {options.length > 1 && (
        <div>
          <p className="text-sm font-bold mb-3">اختر الباقة</p>
          <div className="space-y-2">
            {options.map((option) => {
              const active = selectedId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={`w-full text-right rounded-2xl border px-4 py-3.5 transition-colors ${
                    active
                      ? "border-gold bg-gold/10"
                      : "border-gold/20 bg-card hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          active ? "border-gold bg-gold text-truffle" : "border-gold/40"
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold">{option.name}</div>
                        <div className="text-xs text-muted-foreground">{option.hint}</div>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="font-bold">{option.price} ج.م</div>
                      {option.comparePrice ? (
                        <div className="text-xs text-muted-foreground line-through">
                          {option.comparePrice} ج.م
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold gold-text">{selected.price} ج.م</span>
        {selected.comparePrice ? (
          <span className="text-base text-muted-foreground line-through mb-1">
            {selected.comparePrice} ج.م
          </span>
        ) : null}
      </div>

      <Button
        size="lg"
        variant={isAdded ? "outline" : "glow"}
        className="w-full h-14 text-base"
        onClick={handleAddToCart}
      >
        <ShoppingCart className="w-5 h-5 ml-2" />
        {isAdded ? "تمت الإضافة للسلة" : "أضف للسلة"}
      </Button>
    </div>
  );
}
