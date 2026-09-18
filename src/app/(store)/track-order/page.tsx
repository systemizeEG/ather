"use client";

import { useState } from "react";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Search, Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { trackOrder } from "@/app/actions/track";
import { useTranslation } from "@/components/TranslationProvider";
import { formatMoney, localizeProductTitle, tx } from "@/lib/catalog-i18n";

export default function TrackOrderPage() {
  const { t, locale } = useTranslation();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError("");
    setOrder(null);

    const res = await trackOrder(orderId.trim().toUpperCase());

    if (res.success && res.order) {
      setOrder(res.order);
    } else {
      setError(
        res.error === "لم يتم العثور على طلب بهذا الرقم." ? t.track.notFound : t.track.error
      );
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT_REVIEW":
      case "PENDING_REVIEW":
        return (
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full font-bold border border-orange-500/20">
            <Clock className="w-5 h-5" /> {t.track.pending}
          </div>
        );
      case "PROCESSING":
        return (
          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full font-bold border border-blue-500/20">
            <Package className="w-5 h-5" /> {t.track.processing}
          </div>
        );
      case "COMPLETED":
        return (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full font-bold border border-green-500/20">
            <CheckCircle2 className="w-5 h-5" /> {t.track.completed}
          </div>
        );
      case "CANCELLED":
        return (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-bold border border-red-500/20">
            <XCircle className="w-5 h-5" /> {t.track.cancelled}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageTransition className="pt-28 pb-32">
      <div className="container mx-auto px-4 max-w-3xl">
        <FadeIn className="text-center mb-12">
          <div className="w-20 h-20 bg-accent/10 text-gold-deep rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{t.track.title}</h1>
          <p className="text-muted-foreground text-lg">{t.track.description}</p>
        </FadeIn>

        <FadeIn delay={0.1} className="treasure-frame rounded-2xl p-6 sm:p-8 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute end-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t.track.placeholder}
                className="ps-4 pe-12 h-14 text-lg bg-background border-2 focus-visible:border-accent"
                dir="ltr"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-lg" variant="glow" isLoading={loading}>
              {t.track.cta}
            </Button>
          </form>
          {error && <p className="text-red-500 mt-4 text-center font-medium">{error}</p>}
        </FadeIn>

        {order && (
          <FadeIn delay={0.2} className="treasure-frame rounded-2xl overflow-hidden">
            <div className="bg-muted px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border">
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t.track.orderId}</div>
                <div className="font-mono font-bold text-xl">{order.orderId}</div>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm text-muted-foreground font-medium mb-3 border-b border-border/50 pb-2">
                    {t.track.customer}
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-muted-foreground">{t.track.name}:</span>{" "}
                      <span className="font-medium">{order.customerName}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t.track.phone}:</span>{" "}
                      <span className="font-medium" dir="ltr">{order.phone}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t.track.whatsapp}:</span>{" "}
                      <span className="font-medium" dir="ltr">{order.whatsapp}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-muted-foreground font-medium mb-3 border-b border-border/50 pb-2">
                    {t.track.invoice}
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-muted-foreground">{t.track.payment}:</span>{" "}
                      <span className="font-medium">
                        {order.paymentMethod === "CASH_ON_DELIVERY"
                          ? t.checkout.methodCod
                          : t.checkout.methodInstapay}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t.track.date}:</span>{" "}
                      <span className="font-medium" dir="ltr">
                        {new Date(order.createdAt).toLocaleString(locale === "en" ? "en-GB" : "ar-EG")}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t.track.total}:</span>{" "}
                      <span className="font-bold text-gold-deep text-lg">
                        {formatMoney(order.total, t.common.currency)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {order.notes && (
                <p>
                  <span className="text-muted-foreground">{t.checkout.address}:</span>{" "}
                  <span className="font-medium whitespace-pre-wrap">{order.notes}</span>
                </p>
              )}

              {order.adminNote && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-gold-deep-foreground">
                  <h4 className="font-bold mb-1">{t.track.adminMessage}</h4>
                  <p>{order.adminNote}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold mb-4">
                  {t.track.products} ( {order.items.length} )
                </h3>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-background border border-border rounded-lg p-3">
                      <div>
                        <div className="font-medium">
                          {localizeProductTitle(locale, item.product?.slug || "", item.titleSnapshot)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.track.quantity}: {item.quantity} × {formatMoney(item.priceSnapshot, t.common.currency)}
                          {item.packageNameSnapshot ? ` · ${tx(locale, item.packageNameSnapshot)}` : ""}
                        </div>
                      </div>
                      <div className="font-bold text-gold-deep">
                        {formatMoney(item.quantity * item.priceSnapshot, t.common.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
