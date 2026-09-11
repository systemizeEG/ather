"use client";

import { useState } from "react";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Search, Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { trackOrder } from "@/app/actions/track";

export default function TrackOrderPage() {
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
      setError(res.error || "حدث خطأ");
    }
    
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT_REVIEW":
      case "PENDING_REVIEW":
        return <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full font-bold border border-orange-500/20"><Clock className="w-5 h-5" /> جاري مراجعة الدفع</div>;
      case "PROCESSING":
        return <div className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full font-bold border border-blue-500/20"><Package className="w-5 h-5" /> جاري التجهيز</div>;
      case "COMPLETED":
        return <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full font-bold border border-green-500/20"><CheckCircle2 className="w-5 h-5" /> مكتمل ومسلم</div>;
      case "CANCELLED":
        return <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-bold border border-red-500/20"><XCircle className="w-5 h-5" /> ملغي أو مرفوض</div>;
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
          <h1 className="text-4xl font-bold mb-4">تتبع طلبك</h1>
          <p className="text-muted-foreground text-lg">
            أدخل رقم الطلب الخاص بك لمعرفة حالته ومتابعة التحديثات.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="treasure-frame rounded-2xl p-6 sm:p-8 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="رقم الطلب (مثال: ORD-XXXX)" 
                className="pl-4 pr-12 h-14 text-lg bg-background border-2 focus-visible:border-accent"
                dir="ltr"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-lg" variant="glow" isLoading={loading}>
              تتبع الآن
            </Button>
          </form>
          {error && <p className="text-red-500 mt-4 text-center font-medium">{error}</p>}
        </FadeIn>

        {order && (
          <FadeIn delay={0.2} className="treasure-frame rounded-2xl overflow-hidden">
            <div className="bg-muted px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border">
              <div>
                <div className="text-sm text-muted-foreground mb-1">رقم الطلب</div>
                <div className="font-mono font-bold text-xl">{order.orderId}</div>
              </div>
              <div>
                {getStatusBadge(order.status)}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm text-muted-foreground font-medium mb-3 border-b border-border/50 pb-2">بيانات العميل</h3>
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">الاسم:</span> <span className="font-medium">{order.customerName}</span></p>
                    <p><span className="text-muted-foreground">رقم الهاتف:</span> <span className="font-medium" dir="ltr">{order.phone}</span></p>
                    <p><span className="text-muted-foreground">رقم الواتساب:</span> <span className="font-medium" dir="ltr">{order.whatsapp}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-muted-foreground font-medium mb-3 border-b border-border/50 pb-2">تفاصيل الفاتورة</h3>
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">طريقة الدفع:</span> <span className="font-medium">InstaPay</span></p>
                    <p><span className="text-muted-foreground">تاريخ الطلب:</span> <span className="font-medium" dir="ltr">{new Date(order.createdAt).toLocaleString('ar-EG')}</span></p>
                    <p><span className="text-muted-foreground">الإجمالي:</span> <span className="font-bold text-gold-deep text-lg">{order.total} ج.م</span></p>
                  </div>
                </div>
              </div>

              {order.adminNote && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-gold-deep-foreground">
                  <h4 className="font-bold mb-1">رسالة من الإدارة:</h4>
                  <p>{order.adminNote}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold mb-4">المنتجات ( {order.items.length} )</h3>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-background border border-border rounded-lg p-3">
                      <div>
                        <div className="font-medium">{item.titleSnapshot}</div>
                        <div className="text-xs text-muted-foreground">الكمية: {item.quantity} × {item.priceSnapshot} ج.م</div>
                      </div>
                      <div className="font-bold text-gold-deep">{item.quantity * item.priceSnapshot} ج.م</div>
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
