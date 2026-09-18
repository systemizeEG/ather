"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Banknote } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOrder, getStoreSettings } from "@/app/actions/order";
import { validateDiscountCode } from "@/app/actions/discount";
import { StoreImage } from "@/components/ui/StoreImage";
import { useTranslation } from "@/components/TranslationProvider";
import { formatMoney, localizeProductTitle, tx } from "@/lib/catalog-i18n";
import { PAYMENT_METHODS } from "@/lib/constants";

export default function CheckoutPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const {
    items,
    getCartTotal,
    clearCart,
    appliedDiscount,
    setAppliedDiscount,
    getDiscountAmount,
    getTotalAfterDiscount,
  } = useCartStore();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const { data: session, status } = useSession();
  const PayIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [formData, setFormData] = useState({
    customerName: session?.user?.name || "",
    phone: (session?.user as any)?.phone || "",
    whatsapp: (session?.user as any)?.phone || "",
    email: session?.user?.email || "",
    notes: "",
    address: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]>(
    PAYMENT_METHODS.INSTAPAY
  );

  useEffect(() => {
    setOrderId(`ORD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);

    getStoreSettings().then((res) => {
      if (res) setSettings(res);
    });
  }, []);

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
      setPromoError(res.error || t.track.error);
    }
    setIsValidating(false);
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.whatsapp || !formData.email) return;
    setStep(2);
  };

  const isCod = paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY;

  const submitOrder = async () => {
    if (isCod && !formData.address.trim()) return;
    if (!isCod && !file) return;
    setIsSubmitting(true);

    try {
      let paymentScreenshot: string | null = null;

      if (!isCod && file) {
        setIsUploading(true);
        const fileData = new FormData();
        fileData.append("file", file);

        const uploadRes = await fetch("/api/upload?type=receipt", {
          method: "POST",
          body: fileData,
        });
        const uploadJSON = await uploadRes.json();
        setIsUploading(false);

        if (!uploadJSON.success) {
          throw new Error("Upload failed");
        }
        paymentScreenshot = uploadJSON.url;
      }

      const orderData = {
        orderId,
        customerName: formData.customerName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        notes: formData.address.trim() || formData.notes || undefined,
        subtotal: getCartTotal(),
        total: getTotalAfterDiscount(),
        discountCode: appliedDiscount?.code || null,
        discountAmount: getDiscountAmount(),
        paymentMethod,
        paymentScreenshot,
        items: items.map((item) => ({
          productId: item.product.id,
          titleSnapshot: item.product.title,
          priceSnapshot: item.unitPrice ?? item.product.price,
          quantity: item.quantity,
          packageId: item.packageId || null,
          packageName: item.packageName || null,
          packageQuantity: item.packageQuantity || null,
        })),
      };

      const res = await createOrder(orderData);

      if (res.success) {
        clearCart();
        setStep(3);
      } else {
        alert(t.checkout.submitError);
      }
    } catch (error) {
      console.error(error);
      alert(t.checkout.systemError);
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 3) return null;

  const whatsappHref = (() => {
    let wa = (settings?.whatsappNumber || "201000000000").replace(/[^0-9]/g, "");
    if (wa.startsWith("0")) {
      wa = "20" + wa.substring(1);
    } else if (wa.length > 0 && !wa.startsWith("20")) {
      wa = "20" + wa;
    }
    return `https://wa.me/${wa}?text=${encodeURIComponent(
      `${isCod ? t.checkout.whatsappMessageCod : t.checkout.whatsappMessage}\n\n${t.checkout.orderNumber}: ${orderId}\n${t.checkout.name}: ${formData.customerName}${
        formData.address.trim() ? `\n${t.checkout.address}: ${formData.address.trim()}` : ""
      }`
    )}`;
  })();

  return (
    <PageTransition className="pt-28 pb-32 bg-background/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-center mb-12">
          <div className={`flex items-center ${step >= 1 ? "text-gold-deep" : "text-muted-foreground"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? "border-gold bg-gold/15" : "border-muted-foreground"}`}>1</div>
            <span className="ms-3 font-semibold me-3 hidden sm:block">{t.checkout.stepInfo}</span>
          </div>
          <div className={`w-16 h-1 mx-4 rounded-full ${step >= 2 ? "bg-gold" : "bg-muted"}`}></div>
          <div className={`flex items-center ${step >= 2 ? "text-gold-deep" : "text-muted-foreground"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? "border-gold bg-gold/15" : "border-muted-foreground"}`}>2</div>
            <span className="ms-3 font-semibold me-3 hidden sm:block">{t.checkout.stepPay}</span>
          </div>
          <div className={`w-16 h-1 mx-4 rounded-full ${step >= 3 ? "bg-gold" : "bg-muted"}`}></div>
          <div className={`flex items-center ${step >= 3 ? "text-green-500" : "text-muted-foreground"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? "border-green-500 bg-green-500/10" : "border-muted-foreground"}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="ms-3 font-semibold me-3 hidden sm:block">{t.checkout.stepDone}</span>
          </div>
        </div>

        {step === 1 && (
          <FadeIn className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">{t.checkout.contactTitle}</h2>
              <form onSubmit={proceedToPayment} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    {t.checkout.fullName} <span className="text-red-500">*</span>
                  </label>
                  <Input required name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder={t.checkout.namePlaceholder} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    {t.checkout.phone} <span className="text-red-500">*</span>
                  </label>
                  <Input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01xxxxxxxxx" dir="ltr" className="text-start" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    {t.checkout.whatsapp} <span className="text-red-500">*</span>
                  </label>
                  <Input required name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="01xxxxxxxxx" dir="ltr" className="text-start" />
                  <p className="text-xs text-muted-foreground mt-1">{t.checkout.whatsappHint}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    {t.checkout.email} <span className="text-red-500">*</span>
                  </label>
                  <Input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" dir="ltr" className="text-start" />
                  <p className="text-xs text-muted-foreground mt-1 text-start">{t.checkout.emailHint}</p>
                </div>
                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full">
                    {t.checkout.continuePay} <PayIcon className="ms-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <div className="treasure-frame rounded-2xl p-6 sticky top-28">
                <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">{t.checkout.summary}</h3>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar mb-6">
                  {items.map((item) => (
                    <div key={item.lineId || item.product.id} className="flex gap-4">
                      <div className="w-12 h-12 bg-muted rounded-md overflow-hidden relative shrink-0">
                        {item.product.image ? (
                          <StoreImage src={item.product.image} fill alt="" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs line-clamp-1">
                          {localizeProductTitle(locale, item.product.slug, item.product.title)}
                        </h4>
                        {item.packageName && (
                          <div className="text-[11px] text-gold-deep">{tx(locale, item.packageName)}</div>
                        )}
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>{t.checkout.quantity}: {item.quantity}</span>
                          <span>{formatMoney((item.unitPrice ?? item.product.price) * item.quantity, t.common.currency)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.checkout.subtotal}</span>
                    <span>{formatMoney(getCartTotal(), t.common.currency)}</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-500 font-medium">
                      <div className="flex items-center gap-1">
                        <span>{t.checkout.discount} ({appliedDiscount.code})</span>
                        <button
                          onClick={() => setAppliedDiscount(null)}
                          className="text-[10px] bg-red-500/10 text-red-500 px-1 rounded hover:bg-red-500/20"
                        >
                          {t.checkout.remove}
                        </button>
                      </div>
                      <span>-{formatMoney(getDiscountAmount(), t.common.currency)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                    <span>{t.checkout.total}</span>
                    <span className="text-gold-deep">{formatMoney(getTotalAfterDiscount(), t.common.currency)}</span>
                  </div>
                </div>

                {!appliedDiscount && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">{t.checkout.haveCode}</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t.checkout.enterCode}
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
                        {isValidating ? "..." : t.checkout.apply}
                      </Button>
                    </div>
                    {promoError && <p className="text-[10px] text-red-500 mt-1">{promoError}</p>}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {step === 2 && (
          <FadeIn className="max-w-xl mx-auto">
            <div className="bg-card border border-gold/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold via-gold-deep to-gold"></div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{t.checkout.chooseMethod}</h2>
                <p className="text-muted-foreground">{formatMoney(getTotalAfterDiscount(), t.common.currency)}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.INSTAPAY)}
                  className={`text-start rounded-2xl border p-4 transition-colors cursor-pointer ${
                    !isCod
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/40"
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mb-2 ${!isCod ? "text-gold-deep" : "text-muted-foreground"}`} />
                  <div className="font-bold">{t.checkout.methodInstapay}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.checkout.methodInstapayHint}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH_ON_DELIVERY)}
                  className={`text-start rounded-2xl border p-4 transition-colors cursor-pointer ${
                    isCod
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/40"
                  }`}
                >
                  <Banknote className={`w-6 h-6 mb-2 ${isCod ? "text-gold-deep" : "text-muted-foreground"}`} />
                  <div className="font-bold">{t.checkout.methodCod}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.checkout.methodCodHint}</div>
                </button>
              </div>

              <div className="bg-background border border-border rounded-xl p-5 mb-8 space-y-4">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t.checkout.orderId}</span>
                  <span className="font-mono font-bold text-gold-deep">{orderId}</span>
                </div>
                <div className="flex justify-between py-2 items-center">
                  <span className="text-muted-foreground">{t.checkout.amountDue}</span>
                  <span className="font-bold text-2xl">{formatMoney(getTotalAfterDiscount(), t.common.currency)}</span>
                </div>
              </div>

              {isCod ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-lg font-bold mb-1">{t.checkout.codTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.checkout.codDesc}</p>
                    <label className="block text-sm font-medium mb-2">
                      {t.checkout.address} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={t.checkout.addressPlaceholder}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                    />
                    <p className="text-xs text-muted-foreground mt-2">{t.checkout.addressHint}</p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1" disabled={isSubmitting}>
                      {t.checkout.editData}
                    </Button>
                    <Button
                      onClick={submitOrder}
                      size="lg"
                      variant="glow"
                      disabled={!formData.address.trim() || isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? t.checkout.sending : t.checkout.confirmCod}
                    </Button>
                  </div>

                  <div className="mt-6 flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-gold-deep shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.checkout.codReviewNote}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-background border border-border rounded-xl p-5 mb-8">
                    <div className="flex justify-between py-2 items-center">
                      <span className="text-muted-foreground">{t.checkout.sellerAccount}</span>
                      <div className="text-end" dir="ltr">
                        <span className="font-bold bg-muted px-2 py-1 rounded-md cursor-copy text-gold-deep">
                          {settings?.instapayAccount || "instapay@example"}
                        </span>
                        {settings?.instapayReceiverName && (
                          <div className="text-xs text-muted-foreground mt-1 text-start w-full">
                            {t.checkout.inNameOf}: {settings.instapayReceiverName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-3">
                      {t.checkout.uploadReceipt} <span className="text-red-500">*</span>
                    </label>
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
                          <span className="text-xs text-muted-foreground mt-1">{t.checkout.clickToChange}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center pointer-events-none">
                          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                          <span className="font-medium">{t.checkout.uploadCta}</span>
                          <span className="text-xs text-muted-foreground mt-1">JPEG, PNG, JPG</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1" disabled={isSubmitting}>
                      {t.checkout.editData}
                    </Button>
                    <Button onClick={submitOrder} size="lg" variant="glow" disabled={!file || isSubmitting} className="flex-1">
                      {isSubmitting || isUploading ? t.checkout.sending : t.checkout.confirmSend}
                    </Button>
                  </div>

                  <div className="mt-6 flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-gold-deep shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.checkout.reviewNote}</p>
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        )}

        {step === 3 && (
          <FadeIn className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h2 className="text-3xl font-bold mb-4">{t.checkout.successTitle}</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {t.checkout.yourOrder}{" "}
              <span className="font-mono font-bold text-foreground bg-muted px-2 py-1 rounded inline-block">{orderId}</span>
              . <br />
              {isCod ? t.checkout.successDescCod : t.checkout.successDesc}
            </p>

            <div className="treasure-frame rounded-2xl p-6 mb-8">
              <h3 className="font-bold mb-2">{t.checkout.nextTitle}</h3>
              <p className="text-sm text-muted-foreground mb-4">{isCod ? t.checkout.nextDescCod : t.checkout.nextDesc}</p>

              <a href={whatsappHref} target="_blank" rel="noreferrer" className="block w-full">
                <Button size="lg" className="w-full bg-green-500 text-white hover:bg-green-600">
                  {t.checkout.confirmWhatsapp}
                </Button>
              </a>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/track-order">
                <Button variant="outline">{t.checkout.trackOrder}</Button>
              </Link>
              <Link href="/store">
                <Button variant="secondary">{t.checkout.backToStore}</Button>
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
