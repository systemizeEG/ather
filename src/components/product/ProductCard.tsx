"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Product } from "@prisma/client";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { useCartStore } from "@/store/useCartStore";
import { CornerMarks } from "@/components/ui/Treasure";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <FadeIn delay={0.1 * (index % 3)}>
      <Link href={`/store/${product.slug}`} className="block group h-full">
        <div className="treasure-frame rounded-3xl overflow-hidden h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1">
          <CornerMarks />
          <div className="aspect-[4/5] relative velvet-well overflow-hidden m-[6px] rounded-[1.15rem]">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-pearl/60">لا يوجد صورة</div>
            )}

            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {product.isPopular && (
                <div className="bg-gradient-to-b from-gold to-gold-deep text-truffle text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  الأكثر طلباً
                </div>
              )}
              {product.deliveryType === "INSTANT" && (
                <div className="bg-powder text-truffle text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  شحن سريع
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4">
              {product.category && (
                <div className="bg-pearl/90 backdrop-blur-md text-truffle text-xs px-2 py-1 rounded-full border border-gold/30">
                  {product.category}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1 relative z-10">
            <h3 className="font-display text-lg font-bold group-hover:text-gold-deep transition-colors mb-2">
              {product.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">{product.shortDescription}</p>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gold/25">
              <div className="flex flex-col">
                {product.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">{product.comparePrice} ج.م</span>
                )}
                <span className="text-xl font-bold gold-text">{product.price} ج.م</span>
              </div>

              <Button
                onClick={handleAddToCart}
                variant="secondary"
                size="icon"
                aria-label="أضف للسلة"
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
