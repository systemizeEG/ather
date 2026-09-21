import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { GoldRule } from "@/components/ui/Treasure";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";
import { indexablePage } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  return {
    title: t.faq.title,
    description: t.faq.description,
    ...indexablePage("/faq"),
  };
}

export default async function FAQPage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);

  return (
    <PageTransition className="pt-28 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <FadeIn className="text-center mb-16">
          <GoldRule className="mb-6" />
          <h1 className="font-display text-4xl font-bold mb-4">{t.faq.title}</h1>
          <p className="text-muted-foreground text-lg mb-8">{t.faq.description}</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder={t.faq.search} className="pe-10 bg-card border-border" />
          </div>
        </FadeIn>

        <div className="space-y-6">
          {t.faq.items.map((faq, index) => (
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
