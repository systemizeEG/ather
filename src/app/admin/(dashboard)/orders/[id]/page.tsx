import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { dateLocale, getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function AdminOrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const dateFmt = dateLocale(locale);
  const BackIcon = locale === "ar" ? ArrowLeft : ArrowRight;
  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  let displayImageUrl = order.paymentScreenshot;
  if (order.paymentScreenshot && !order.paymentScreenshot.startsWith("http")) {
    const { getReceiptSignedUrl } = await import("@/app/actions/admin");
    const result = await getReceiptSignedUrl(order.paymentScreenshot);
    if (result.url) displayImageUrl = result.url;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{t.admin.orderDetails}</h1>
            <span className="font-mono bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm">
              {order.orderId}
            </span>
          </div>
          <p className="text-muted-foreground">
            {t.admin.orderDate}: {new Date(order.createdAt).toLocaleString(dateFmt)}
          </p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline">
            {t.admin.backToOrders} <BackIcon className="w-4 h-4 ms-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" /> {t.admin.manageStatus}
            </h2>
            <OrderStatusForm order={order} />
          </div>

          <div className="bg-card border border-border p-0 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-muted/30 border-b border-border">
              <h2 className="text-lg font-bold">{t.admin.orderedProducts}</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex justify-between items-center hover:bg-muted/10">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.titleSnapshot}</h3>
                    {item.packageNameSnapshot && (
                      <p className="text-sm text-accent mb-1">
                        {item.packageNameSnapshot}
                        {item.packageQuantitySnapshot ? ` · ${item.packageQuantitySnapshot} ${t.admin.pieces}` : ""}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {t.admin.quantity}: {item.quantity}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-accent text-lg">
                      {item.priceSnapshot * item.quantity} {t.common.currency}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {item.priceSnapshot} {t.admin.perPiece}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="p-6 bg-muted/10 space-y-2 border-t border-border">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{t.checkout.subtotal}</span>
                  <span>
                    {order.subtotal} {t.common.currency}
                  </span>
                </div>
                {order.discountCode && (
                  <div className="flex justify-between items-center text-sm text-green-500 font-medium">
                    <span>
                      {t.checkout.discount} ({order.discountCode})
                    </span>
                    <span>
                      -{order.discountAmount} {t.common.currency}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="font-bold text-lg">{t.admin.colTotal}</span>
                  <span className="font-black text-2xl text-accent">
                    {order.total} {t.common.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-3">{t.admin.customerData}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.admin.customer}</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.admin.phone}</p>
                <a
                  href={`tel:${order.phone}`}
                  className="font-medium hover:text-accent transition-colors block"
                  dir="ltr"
                >
                  {order.phone}
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.admin.whatsapp}</p>
                {(() => {
                  let whatsapp = (order.whatsapp || "").replace(/[^0-9]/g, "");
                  if (whatsapp.startsWith("0")) {
                    whatsapp = "20" + whatsapp.substring(1);
                  } else if (!whatsapp.startsWith("20")) {
                    whatsapp = "20" + whatsapp;
                  }
                  return (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-medium text-green-500 hover:text-green-600 transition-colors"
                      dir="ltr"
                    >
                      {order.whatsapp} <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                })()}
              </div>
              {order.email && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t.admin.email}</p>
                  <a
                    href={`mailto:${order.email}`}
                    className="font-medium hover:text-accent transition-colors block"
                    dir="ltr"
                  >
                    {order.email}
                  </a>
                </div>
              )}
              {order.notes && (
                <div className="bg-muted p-3 rounded-lg mt-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    {order.paymentMethod === "CASH_ON_DELIVERY"
                      ? `${t.admin.deliveryAddress}:`
                      : `${t.admin.customerNotes}:`}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-3">{t.admin.paymentReceipt}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{t.admin.paymentMethod}</p>
                <p className="font-bold bg-accent/10 text-accent px-2 py-1 rounded">
                  {order.paymentMethod === "CASH_ON_DELIVERY" ? t.admin.cashOnDelivery : t.admin.instapay}
                </p>
              </div>
              {order.paymentMethod === "CASH_ON_DELIVERY" ? (
                <div className="bg-gold/10 text-gold-deep p-4 rounded-xl text-sm">{t.admin.cashNoReceipt}</div>
              ) : displayImageUrl ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t.admin.attachedReceipt}</p>
                  <a
                    href={displayImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative aspect-[4/5] bg-muted rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-colors group cursor-zoom-in"
                  >
                    <Image src={displayImageUrl} alt="Payment Proof" fill className="object-cover" />
                    <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="w-4 h-4 ms-0 me-2" /> {t.admin.enlargeImage}
                      </Button>
                    </div>
                  </a>
                </div>
              ) : (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{t.admin.noReceipt}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
