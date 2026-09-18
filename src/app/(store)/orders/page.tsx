import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";
import { formatMoney, localizeProductTitle, tx } from "@/lib/catalog-i18n";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { color: string; icon: typeof Clock }> = {
  PENDING_PAYMENT_REVIEW: { color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  PENDING_REVIEW: { color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  PROCESSING: { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Package },
  COMPLETED: { color: "text-green-500 bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
  CANCELLED: { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertCircle },
  DECLINED: { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertCircle },
};

export default async function OrdersPage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "CUSTOMER") {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="pt-28 pb-32 min-h-screen bg-background/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-gold-deep" />
            {t.orders.title}
          </h1>
          <Link href="/store">
            <Button variant="outline">{t.orders.continue}</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t.orders.emptyTitle}</h2>
            <p className="text-muted-foreground mb-6">{t.orders.emptyDesc}</p>
            <Link href="/store">
              <Button size="lg" variant="glow">{t.orders.goStore}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const style = statusStyles[order.status] || {
                color: "text-gray-500 bg-gray-500/10 border-gray-500/20",
                icon: Clock,
              };
              const StatusIcon = style.icon;
              const statusLabel =
                t.status[order.status as keyof typeof t.status] || order.status;

              return (
                <div key={order.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-accent/30 hover:shadow-accent/5">
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 bg-muted/20">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-bold text-lg">{order.orderId}</span>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${style.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusLabel}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-end">
                      <p className="text-sm text-muted-foreground mb-0.5">{t.orders.total}</p>
                      <p className="text-xl font-bold text-gold-deep">{formatMoney(order.total, t.common.currency)}</p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
                      {t.orders.products} ({order.items.length})
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-muted-foreground/50" />
                            </div>
                            <div>
                              <p className="font-medium text-sm line-clamp-1">
                                {localizeProductTitle(locale, "", item.titleSnapshot)}
                              </p>
                              {item.packageNameSnapshot && (
                                <p className="text-xs text-gold-deep">{tx(locale, item.packageNameSnapshot)}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {t.orders.quantity}: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="font-bold text-sm">
                            {formatMoney(item.priceSnapshot * item.quantity, t.common.currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
