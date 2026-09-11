import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { GoldRule } from "@/components/ui/Treasure";

export const metadata = {
  title: "الأسئلة الشائعة",
  description: "الأسئلة الشائعة حول الشراء والدفع والشحن في متجر أثر.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "كيف يمكنني الدفع؟",
      a: "نقبل الدفع عبر InstaPay. بعد تأكيد الطلب ستظهر لك بيانات التحويل مع رقم طلب مميز، ويُرجى إرفاق صورة إيصال التحويل لإتمام المراجعة."
    },
    {
      q: "متى يصل طلبي؟",
      a: "بعد تأكيد الدفع نجهّز القطعة بتغليف فاخر. الشحن داخل مصر عادة خلال 1 إلى 4 أيام عمل حسب المدينة. القطع المميزة بـ «شحن سريع» تُخرَج في أقرب شحنة."
    },
    {
      q: "هل يمكنني الإرجاع أو الاستبدال؟",
      a: "نعم، يمكن مراجعة طلب الاستبدال أو الإرجاع خلال 48 ساعة من الاستلام إذا كانت القطعة بحالتها الأصلية مع التغليف. تواصلي مع الدعم عبر واتساب لتسهيل الإجراء."
    },
    {
      q: "ماذا لو حوّلت مبلغاً خاطئاً؟",
      a: "حوّلي المبلغ المطابق للإجمالي لتسريع المراجعة. إن حدث خطأ، تواصلي مع الدعم مع إرفاق الإيصال ورقم الطلب."
    },
    {
      q: "هل القطع أصلية؟",
      a: "كل قطعة في أثر مختارة بعناية من خامات وجودة نعرضها بوضوح في صفحة المنتج. إن لم تطابق الوصف، فريقنا يتحمل المسؤولية."
    }
  ];

  return (
    <PageTransition className="pt-28 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <FadeIn className="text-center mb-16">
          <GoldRule className="mb-6" />
          <h1 className="font-display text-4xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground text-lg mb-8">
            إجابات هادئة لكل ما يخص التسوق مع أثر.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="ابحث عن سؤالك..." className="pr-10 bg-card border-border" />
          </div>
        </FadeIn>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={0.1 * index}>
              <div className="treasure-frame rounded-2xl p-6 group">
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-gold-deep transition-colors">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
