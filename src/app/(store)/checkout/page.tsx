"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, CheckCircle2, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOrder, getStoreSettings } from "@/app/actions/order";
import { validateDiscountCode } from "@/app/actions/discount";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    items, 
    getCartTotal, 
    clearCart, 
    appliedDiscount, 
    setAppliedDiscount,
    getDiscountAmount,
    getTotalAfterDiscount 
  } = useCartStore();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const { data: session, status } = useSession();
  
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [promoError, setPromoError] = useState("");
  
  const [formData, setFormData] = useState({
    customerName: session?.user?.name || "",
    phone: (session?.user as any)?.phone || "",
    whatsapp: (session?.user as any)?.phone || "",
    email: session?.user?.email || "",
    notes: ""
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Generate a unique short order ID (e.g., ORD-7A2B)
    setOrderId(`ORD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    
    // Fetch settings for InstaPay details
    getStoreSettings().then(res => {
      if(res) setSettings(res);
    });
  }, []);

  // Redirect if cart is empty or not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (items.length === 0 && step === 1) {
      router.push("/cart");
    }
  }, [items, router, step, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleApplyDiscount = async () => {
    if (!promoCode) return;
    setIsValidating(true);
    setPromoError("");
    
    const res = await validateDiscountCode(promoCode);
    if (res.success && res.discount) {
      setAppliedDiscount(res.discount);
      setPromoCode("");
    } else {
      setPromoError(res.error || "خطأ غير معروف");
    }
    setIsValidating(false);
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.whatsapp || !formData.email) return;
    setStep(2);
  };

  const submitOrder = async () => {
    if (!file) return;
    setIsSubmitting(true);
    
    try {
      // 1. Upload File
      setIsUploading(true);
      const fileData = new FormData();
      fileData.append("file", file);
      
      const uploadRes = await fetch("/api/upload?type=receipt", {
        method: "POST",
        body: fileData
      });
      const uploadJSON = await uploadRes.json();
      setIsUploading(false);

      if (!uploadJSON.success) {
        throw new Error("Upload failed");
      }

      // 2. Create Order
      const orderData = {
        orderId,
        ...formData,
        subtotal: getCartTotal(),
        total: getTotalAfterDiscount(),
        discountCode: appliedDiscount?.code || null,
        discountAmount: getDiscountAmount(),
        paymentMethod: "INSTAPAY",
        paymentScreenshot: uploadJSON.url,
        items: items.map(item => ({
          productId: item.product.id,
          titleSnapshot: item.product.title,
          priceSnapshot: item.product.price,
          quantity: item.quantity
        }))
      };

      const res = await createOrder(orderData);
      
      if (res.success) {
        clearCart();
        setStep(3); // Success Step
      } else {
        alert("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.");
      }

    } catch (error) {
      console.error(error);
      alert("حدث خطأ في النظام. يرجى التواصل مع الدعم.");
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 3) return null; // Let useEffect redirect


  return (
    <PageTransition className="pt-28 pb-32 bg-background/50">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          <div className={`flex items-center ${step >= 1 ? 'text-gold-deep' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-gold bg-gold/15' : 'border-muted-foreground'}`}>1</div>
            <span className="ml-3 font-semibold mr-3 hidden sm:block">البيانات الشخصية</span>
          </div>
          <div className={`w-16 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-gold' : 'bg-muted'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-gold-deep' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-gold bg-gold/15' : 'border-muted-foreground'}`}>2</div>
            <span className="ml-3 font-semibold mr-3 hidden sm:block">الدفع (InstaPay)</span>
          </div>
          <div className={`w-16 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-gold' : 'bg-muted'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-green-500' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? 'border-green-500 bg-green-500/10' : 'border-muted-foreground'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="ml-3 font-semibold mr-3 hidden sm:block">تأكيد الطلب</span>
          </div>
        </div>

        {/* Step 1: Customer Info */}
        {step === 1 && (
          <FadeIn className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">بيانات التواصل</h2>
              <form onSubmit={proceedToPayment} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">الاسم بالكامل <span className="text-red-500">*</span></label>
                  <Input required name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="مثال: أحمد محمد" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">رقم الهاتف <span className="text-red-500">*</span></label>
                  <Input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01xxxxxxxxx" dir="ltr" className="text-right" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">رقم الواتساب <span className="text-red-500">*</span></label>
                  <Input required name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="01xxxxxxxxx" dir="ltr" className="text-right" />
                  <p className="text-xs text-muted-foreground mt-1">سيتم إرسال تفاصيل المنتج واستلامه عبر هذا الرقم.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <Input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" dir="ltr" className="text-right" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">هذا هو البريد الإلكتروني الذي سيتم إنشاء الحساب عليه (إجباري).</p>
                </div>
                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full">
                    المتابعة للدفع <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="treasure-frame rounded-2xl p-6 sticky top-28">
                <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">ملخص الطلب</h3>
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar mb-6">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-12 h-12 bg-muted rounded-md overflow-hidden relative shrink-0">
                        {item.product.image ? (
                          <Image src={item.product.image} fill alt="" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs line-clamp-1">{item.product.title}</h4>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>الكمية: {item.quantity}</span>
                          <span>{item.product.price * item.quantity} ج.م</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span>{getCartTotal()} ج.م</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-500 font-medium">
                      <div className="flex items-center gap-1">
                        <span>الخصم ({appliedDiscount.code})</span>
                        <button 
                          onClick={() => setAppliedDiscount(null)}
                          className="text-[10px] bg-red-500/10 text-red-500 px-1 rounded hover:bg-red-500/20"
                        >
                          حذف
                        </button>
                      </div>
                      <span>-{getDiscountAmount()} ج.م</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                    <span>الإجمالي</span>
                    <span className="text-gold-deep">{getTotalAfterDiscount()} ج.م</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                {!appliedDiscount && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">هل لديك كود خصم؟</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="أدخل الكود" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="text-xs h-9"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleApplyDiscount}
                        disabled={isValidating || !promoCode}
                        className="shrink-0 h-9"
                      >
                        {isValidating ? "..." : "تطبيق"}
                      </Button>
                    </div>
                    {promoError && <p className="text-[10px] text-red-500 mt-1">{promoError}</p>}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step 2: InstaPay Payment */}
        {step === 2 && (
          <FadeIn className="max-w-xl mx-auto">
            <div className="bg-card border border-accent/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(0,240,255,0.05)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent via-blue-500 to-green-500"></div>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/15 text-gold-deep rounded-full mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">الدفع عبر InstaPay</h2>
                <p className="text-muted-foreground">يرجى تحويل المبلغ المطلوب إلى الحساب التالي وإرفاق صورة الإيصال (سكرين شوت).</p>
              </div>

              <div className="bg-background border border-border rounded-xl p-5 mb-8 space-y-4">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">رقم الطلب (للمراجعة)</span>
                  <span className="font-mono font-bold text-gold-deep">{orderId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">المبلغ الإجمالي المطلـوب</span>
                  <span className="font-bold text-2xl">{getTotalAfterDiscount()} ج.م</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50 items-center">
                  <span className="text-muted-foreground">حساب البائع (InstaPay)</span>
                  <div className="text-left" dir="ltr">
                    <span className="font-bold bg-muted px-2 py-1 rounded-md cursor-copy text-gold-deep">
                      {settings?.instapayAccount || "instapay@example"}
                    </span>
                    {settings?.instapayReceiverName && (
                      <div className="text-xs text-muted-foreground mt-1 text-right w-full">باسم: {settings.instapayReceiverName}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-3">إرفاق صورة التحويل (إجباري) <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors bg-background relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                      <span className="font-medium text-green-500">{file.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">انقر للتغيير</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center pointer-events-none">
                      <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                      <span className="font-medium">اضغط هنا لرفع صورة الإيصال</span>
                      <span className="text-xs text-muted-foreground mt-1">JPEG, PNG, JPG</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1" disabled={isSubmitting}>
                  تعديل البيانات
                </Button>
                <Button onClick={submitOrder} size="lg" variant="glow" disabled={!file || isSubmitting} className="flex-1">
                  {isSubmitting || isUploading ? "جاري الإرسال..." : "تأكيد وإرسال الطلب"}
                </Button>
              </div>

              <div className="mt-6 flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-gold-deep shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  بمجرد إرسال الطلب، سيقوم فريقنا بمراجعة التحويل يدوياً ومطابقته في أسرع وقت. سيتم إرسال المنتجات تلقائياً إلى رقم الواتساب الخاص بك.
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <FadeIn className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">تم استلام طلبك بنجاح!</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              رقم طلبك هو <span className="font-mono font-bold text-foreground bg-muted px-2 py-1 rounded inline-block">{orderId}</span>. <br/>
              جاري مراجعة الدفع الآن.
            </p>

            <div className="treasure-frame rounded-2xl p-6 mb-8">
              <h3 className="font-bold mb-2">الخطوة القادمة؟</h3>
              <p className="text-sm text-muted-foreground mb-4">
                تواصل معنا عبر رسائل الواتس اب وقم بإرسال رقم طلبك لتسريع عملية المراجعة والاستلام الفوري!
              </p>
              
              <a 
                href={(() => {
                  let wa = (settings?.whatsappNumber || "201000000000").replace(/[^0-9]/g, '');
                  if (wa.startsWith('0')) {
                    wa = '20' + wa.substring(1);
                  } else if (wa.length > 0 && !wa.startsWith('20')) {
                    wa = '20' + wa;
                  }
                  return `https://wa.me/${wa}?text=${encodeURIComponent(`مرحباً، لقد قمت بإنشاء طلب جديد وأريد تسريع المراجعة.\n\nرقم الطلب: ${orderId}\nالاسم: ${formData.customerName}`)}`;
                })()} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full"
              >
                <Button size="lg" className="w-full bg-green-500 text-white hover:bg-green-600">
                  تأكيد عبر الواتساب الآن
                </Button>
              </a>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/track-order">
                <Button variant="outline">تتبع الطلب</Button>
              </Link>
              <Link href="/store">
                <Button variant="secondary">العودة للمتجر</Button>
              </Link>
            </div>
          </FadeIn>
        )}

      </div>
    </PageTransition>
  );
}
