import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export default async function AdminOrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  });

  if (!order) notFound();

  // If it's a Supabase path (not a full URL), generate a signed URL
  let displayImageUrl = order.paymentScreenshot;
  if (order.paymentScreenshot && !order.paymentScreenshot.startsWith('http')) {
    const { getReceiptSignedUrl } = await import("@/app/actions/admin");
    const result = await getReceiptSignedUrl(order.paymentScreenshot);
    if (result.url) displayImageUrl = result.url;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">تفاصيل الطلب</h1>
            <span className="font-mono bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm">{order.orderId}</span>
          </div>
          <p className="text-muted-foreground">التاريخ: {new Date(order.createdAt).toLocaleString('ar-EG')}</p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline">
            العودة للطلبات <ArrowLeft className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Info Left */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Status Update Form (Client Component) */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" /> إدارة حالة الطلب
            </h2>
            <OrderStatusForm order={order} />
          </div>

          <div className="bg-card border border-border p-0 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-muted/30 border-b border-border">
              <h2 className="text-lg font-bold">المنتجات المطلوبة</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map(item => (
                <div key={item.id} className="p-6 flex justify-between items-center hover:bg-muted/10">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.titleSnapshot}</h3>
                    <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-accent text-lg">{item.priceSnapshot * item.quantity} ج.م</p>
                    {item.quantity > 1 && <p className="text-xs text-muted-foreground">{item.priceSnapshot} للقطعة</p>}
                  </div>
                </div>
              ))}
              <div className="p-6 bg-muted/10 space-y-2 border-t border-border">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{order.subtotal} ج.م</span>
                </div>
                {order.discountCode && (
                  <div className="flex justify-between items-center text-sm text-green-500 font-medium">
                    <span>الخصم ({order.discountCode})</span>
                    <span>-{order.discountAmount} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="font-bold text-lg">الإجمالي</span>
                  <span className="font-black text-2xl text-accent">{order.total} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Right */}
        <div className="space-y-8">
          
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-3">بيانات العميل</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">الاسم</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">رقم الهاتف</p>
                <a href={`tel:${order.phone}`} className="font-medium hover:text-accent transition-colors block" dir="ltr">{order.phone}</a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">رقم الواتساب</p>
                {(() => {
                  let whatsapp = (order.whatsapp || "").replace(/[^0-9]/g, '');
                  if (whatsapp.startsWith('0')) {
                    whatsapp = '20' + whatsapp.substring(1);
                  } else if (!whatsapp.startsWith('20')) {
                    whatsapp = '20' + whatsapp;
                  }
                  return (
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-green-500 hover:text-green-600 transition-colors" dir="ltr">
                      {order.whatsapp} <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                })()}
              </div>
              {order.email && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <a href={`mailto:${order.email}`} className="font-medium hover:text-accent transition-colors block" dir="ltr">{order.email}</a>
                </div>
              )}
              {order.notes && (
                <div className="bg-muted p-3 rounded-lg mt-2">
                  <p className="text-xs text-muted-foreground mb-1">ملاحظات العميل:</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-3">إيصال الدفع</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                <p className="font-bold bg-accent/10 text-accent px-2 py-1 rounded">InstaPay</p>
              </div>
              {displayImageUrl ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">صورة التحويل المرفقة:</p>
                  <a href={displayImageUrl} target="_blank" rel="noreferrer" className="block relative aspect-[4/5] bg-muted rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-colors group cursor-zoom-in">
                    <Image src={displayImageUrl} alt="Payment Proof" fill className="object-cover" />
                    <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm"><ExternalLink className="w-4 h-4 ml-2" /> تكبير الصورة</Button>
                    </div>
                  </a>
                </div>
              ) : (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">لم يتم إرفاق إيصال دفع لهذا الطلب.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
