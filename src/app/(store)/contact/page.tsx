import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoldRule, TreasureFrame } from "@/components/ui/Treasure";

export const metadata = {
  title: "تواصل معنا",
  description: "خدمة عملاء أثر للمساعدة في الطلبات والشحن واختيار القطع.",
};

export default function ContactPage() {
  return (
    <PageTransition className="pt-28 pb-32">
      <div className="container mx-auto px-4 max-w-5xl">
        <FadeIn className="text-center mb-16">
          <GoldRule className="mb-6" />
          <h1 className="font-display text-4xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-muted-foreground text-lg">
            فريق أثر قريب منك — للمساعدة في اختيار القطعة، متابعة الشحن، أو أي استفسار.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeIn delay={0.1}>
          <TreasureFrame className="h-full text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">دعم الواتساب</h3>
            <p className="text-muted-foreground text-sm mb-6 flex-grow">
              للرد المباشر على الطلبات، المقاسات، وحالة الشحن.
            </p>
            <a href="https://wa.me/201275011232" target="_blank" rel="noreferrer" className="w-full">
              <Button className="w-full bg-green-600 text-white hover:bg-green-700">تحدثي إلينا الآن</Button>
            </a>
          </TreasureFrame>
          </FadeIn>

          <FadeIn delay={0.2}>
          <TreasureFrame className="h-full text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-powder/15 text-powder rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">البريد الإلكتروني</h3>
            <p className="text-muted-foreground text-sm mb-6 flex-grow">
              للشراكات أو الاستفسارات التجارية، راسلينا عبر البريد.
            </p>
            <a href="mailto:hello@ather.store" className="w-full">
              <Button variant="outline" className="w-full">إرسال بريد</Button>
            </a>
          </TreasureFrame>
          </FadeIn>

          <FadeIn delay={0.3}>
          <TreasureFrame className="h-full text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">شحن لكل مصر</h3>
            <p className="text-muted-foreground text-sm mb-6 flex-grow">
              متجر إلكتروني بتغليف فاخر وشحن موثوق إلى جميع المحافظات.
            </p>
            <Button variant="secondary" className="w-full pointer-events-none">أونلاين</Button>
          </TreasureFrame>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
