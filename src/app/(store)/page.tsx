import Link from "next/link";
import { listFeaturedProducts, listLiveCategories } from "@/lib/catalog";
import { getTranslation } from "@/lib/dictionaries";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { getRequestLocale } from "@/lib/locale";
import { localizeCategoryName } from "@/lib/catalog-i18n";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/constants";
import { indexablePage } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  ...indexablePage("/"),
};

const fallbackRooms = [
  { ar: "مجوهرات", en: "Jewelry", note: "01", href: "/store" },
  { ar: "حقائب", en: "Bags", note: "02", href: "/store" },
  { ar: "ساعات", en: "Watches", note: "03", href: "/store" },
  { ar: "هدايا", en: "Gifts", note: "04", href: "/store" },
  { ar: "أساور", en: "Bracelets", note: "05", href: "/store" },
  { ar: "سلاسل", en: "Necklaces", note: "06", href: "/store" },
];

export default async function HomePage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);

  const [featuredProducts, liveCategories] = await Promise.all([
    listFeaturedProducts(6),
    listLiveCategories(6),
  ]);

  const rooms =
    liveCategories.length > 0
      ? liveCategories.map((category, index) => ({
          ar: category.name,
          en: localizeCategoryName("en", category.slug, category.name),
          note: String(index + 1).padStart(2, "0"),
          href: `/category/${category.slug}`,
        }))
      : fallbackRooms;

  return (
    <div className="w-full min-h-screen">
      <HeroSection
        locale={locale}
        copy={{
          badge: t.home.heroBadge,
          title1: t.home.heroTitle1,
          highlight: t.home.heroTitleHighlight,
          title2: t.home.heroTitle2,
          description: t.home.heroDescription,
          browse: t.home.browseProducts,
          how: t.home.howItWorks,
        }}
      />

      <section id="categories" className="bg-velvet scroll-mt-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {rooms.map((room) => (
            <Link
              key={room.note}
              href={room.href}
              className="group border-t border-s border-gold/20 px-6 py-12 text-center hover:bg-gold/5 transition-colors"
            >
              <span className="block text-gold/70 text-[10px] tracking-[0.4em] mb-3">{room.note}</span>
              <span className="font-display text-pearl text-2xl group-hover:text-gold transition-colors">
                {locale === "en" ? room.en : room.ar}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="lookbook" className="bg-pearl py-20 md:py-24 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-gold mb-3">{t.home.lookbook}</p>
              <h2 className="font-display text-3xl md:text-5xl mb-3">{t.home.featuredProducts}</h2>
              <p className="text-muted-foreground">{t.home.featuredProductsDesc}</p>
            </div>
            <Link
              href="/store"
              className="hidden sm:inline text-sm tracking-[0.18em] uppercase text-truffle border-b border-gold pb-1"
            >
              {t.home.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} locale={locale} animate={false} />
              ))
            ) : (
              <div className="col-span-full treasure-frame rounded-3xl py-16 text-center text-muted-foreground">
                {t.home.comingSoon}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-pearl px-6 md:px-16 pb-24">
        <div className="max-w-4xl mx-auto text-center border-t border-gold/25 pt-20">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-8">{t.home.whyChooseUs}</p>
          <blockquote className="font-display text-3xl md:text-4xl leading-snug text-truffle">
            {t.home.whyChooseUsDesc}
          </blockquote>
          <div className="mt-16 grid md:grid-cols-3 gap-10 text-start">
            <div className="border-t border-gold/40 pt-6">
              <h3 className="font-display text-xl mb-3">{t.home.features.f1Title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t.home.features.f1Desc}</p>
            </div>
            <div className="border-t border-gold/40 pt-6">
              <h3 className="font-display text-xl mb-3">{t.home.features.f2Title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t.home.features.f2Desc}</p>
            </div>
            <div className="border-t border-gold/40 pt-6">
              <h3 className="font-display text-xl mb-3">{t.home.features.f3Title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t.home.features.f3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
