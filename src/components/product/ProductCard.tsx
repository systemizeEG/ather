"use client";

import Link from "next/link";
import { StoreImage } from "@/components/ui/StoreImage";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { useCartStore } from "@/store/useCartStore";
import { CornerMarks } from "@/components/ui/Treasure";
import { useTranslation } from "@/components/TranslationProvider";
import { formatMoney, localizeProduct } from "@/lib/catalog-i18n";
import type { Locale } from "@/lib/dictionaries";

export type ProductCardProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  image: string | null;
  price: number;
  comparePrice: number | null;
  isPopular: boolean;
  deliveryType: string | null;
  category?: { name: string; slug: string } | null;
};

export function ProductCard({
  product,
  index = 0,
  locale: localeProp,
}: {
  product: ProductCardProduct;
  index?: number;
  locale?: Locale;
}) {
  const translation = useTranslation();
  const locale = translation.locale || localeProp || "ar";
  const t = translation.t;
  const localized = localizeProduct(locale, product);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      slug: product.slug,
      title: localized.title,
      shortDescription: localized.shortDescription,
      image: product.image,
      price: product.price,
      comparePrice: product.comparePrice,
      categoryName: localized.category?.name,
    });
  };

  return (
    <FadeIn delay={0.1 * (index % 3)}>
      <Link href={`/store/${product.slug}`} className="block group h-full">
        <div className="treasure-frame rounded-3xl overflow-hidden h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1">
          <CornerMarks />
          <div className="aspect-[4/5] relative velvet-well overflow-hidden m-[6px] rounded-[1.15rem]">
            {product.image ? (
              <StoreImage
                src={product.image}
                alt={localized.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-pearl/60">{t.product.noImage}</div>
            )}

            <div className="absolute top-4 end-4 flex flex-col gap-2">
              {product.isPopular && (
                <div className="bg-gradient-to-b from-gold to-gold-deep text-truffle text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {t.product.popular}
                </div>
              )}
              {product.deliveryType === "INSTANT" && (
                <div className="bg-powder text-truffle text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {t.product.fastShipping}
                </div>
              )}
            </div>

            <div className="absolute top-4 start-4">
              {localized.category && (
                <div className="bg-pearl/90 backdrop-blur-md text-truffle text-xs px-2 py-1 rounded-full border border-gold/30">
                  {localized.category.name}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1 relative z-10">
            <h3 className="font-display text-lg font-bold group-hover:text-gold-deep transition-colors mb-2">
              {localized.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">{localized.shortDescription}</p>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gold/25">
              <div className="flex flex-col">
                {product.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatMoney(product.comparePrice, t.common.currency)}
                  </span>
                )}
                <span className="text-xl font-bold gold-text">{formatMoney(product.price, t.common.currency)}</span>
              </div>

              <Button
                onClick={handleAddToCart}
                variant="secondary"
                size="icon"
                aria-label={t.product.addToCart}
                className="rounded-full hover:bg-gold hover:text-truffle transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}
