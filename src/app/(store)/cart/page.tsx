"use client";

import { useCartStore } from "@/store/useCartStore";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { StoreImage } from "@/components/ui/StoreImage";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/components/TranslationProvider";
import { formatMoney, localizeProductShort, localizeProductTitle, tx } from "@/lib/catalog-i18n";

export default function CartPage() {
  const { t, locale } = useTranslation();
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const CheckoutIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const itemCount = items.reduce((acc, idx) => acc + idx.quantity, 0);

  if (items.length === 0) {
    return (
      <PageTransition className="pt-32 pb-24 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-4">{t.cart.emptyTitle}</h1>
          <p className="text-muted-foreground mb-8">{t.cart.emptyDesc}</p>
          <Link href="/store">
            <Button size="lg" variant="glow">{t.cart.backToShop}</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="pt-28 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <FadeIn className="mb-10 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-gold-deep" />
          <h1 className="text-3xl font-bold">{t.cart.title}</h1>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => {
              const title = localizeProductTitle(locale, item.product.slug, item.product.title);
              const short = localizeProductShort(locale, item.product.slug, item.product.shortDescription);
              const categoryName = tx(locale, item.product.categoryName) || item.product.categoryName;
              const packageName = tx(locale, item.packageName) || item.packageName;

              return (
                <FadeIn key={item.lineId || `${item.product.id}-${index}`} delay={index * 0.1}>
                  <div className="treasure-frame rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-stretch group">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-auto shrink-0 bg-muted/50 rounded-xl overflow-hidden">
                      {item.product.image ? (
                        <StoreImage src={item.product.image} alt={title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                          {t.cart.image}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between flex-1 w-full">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {categoryName && (
                            <div className="text-xs text-gold-deep font-bold mb-1">{categoryName}</div>
                          )}
                          <h3 className="text-lg font-bold mb-1 line-clamp-1">{title}</h3>
                          {packageName && (
                            <div className="text-sm font-semibold text-gold-deep mb-1">
                              {packageName}
                              {item.packageQuantity ? ` · ${item.packageQuantity} ${t.cart.pieces}` : ""}
                            </div>
                          )}
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{short}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.lineId || item.product.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-2 shrink-0 bg-red-500/5 rounded-full hover:bg-red-500/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-4 bg-background border border-border rounded-lg px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.lineId || item.product.id, Math.max(1, item.quantity - 1))}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.lineId || item.product.id, item.quantity + 1)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-end">
                          <div className="text-xl font-bold text-gold-deep">
                            {formatMoney(((item.unitPrice ?? item.product.price) * item.quantity), t.common.currency)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {formatMoney(item.unitPrice ?? item.product.price, t.common.currency)} {t.cart.perOption}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <FadeIn delay={0.3} className="treasure-frame rounded-2xl p-6 sticky top-28">
              <h3 className="text-xl font-bold mb-6 border-b border-gold/25 pb-4">{t.cart.summary}</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t.cart.subtotal} ({itemCount} {t.cart.products})</span>
                  <span>{formatMoney(getCartTotal(), t.common.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t.cart.paymentFee}</span>
                  <span className="text-green-500 font-medium">{t.cart.free}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-between items-center mb-8">
                <span className="text-lg font-bold">{t.cart.totalDue}</span>
                <span className="text-2xl font-black gold-text">{formatMoney(getCartTotal(), t.common.currency)}</span>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button size="lg" variant="glow" className="w-full text-lg h-14">
                  {t.cart.checkout} <CheckoutIcon className="ms-2 w-5 h-5" />
                </Button>
              </Link>

              <div className="mt-6 text-center">
                <Link href="/store" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                  {t.cart.continueShopping}
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
