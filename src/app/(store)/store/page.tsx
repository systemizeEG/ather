import { listActiveCategories, listActiveProducts } from "@/lib/catalog";
import Link from "next/link";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { ProductCard } from "@/components/product/ProductCard";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";
import { localizeCategoryName } from "@/lib/catalog-i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  return {
    title: t.store.title,
    description: t.store.description,
  };
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const { q, category } = await searchParams;
  const [categories, products] = await Promise.all([
    listActiveCategories(),
    listActiveProducts({ q, category }),
  ]);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-32 pb-20">
        <FadeIn className="mb-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-3">{t.store.kicker}</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            {q?.trim() ? t.store.resultsFor : t.store.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            {q?.trim() ? `“${q.trim()}”` : t.store.description}
          </p>
        </FadeIn>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/store"
              className={`px-4 py-2 rounded-full text-sm border ${
                !category ? "bg-gold text-truffle border-gold" : "border-gold/30 hover:border-gold"
              }`}
            >
              {t.store.all}
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                href={`/category/${item.slug}`}
                className={`px-4 py-2 rounded-full text-sm border ${
                  category === item.slug ? "bg-gold text-truffle border-gold" : "border-gold/30 hover:border-gold"
                }`}
              >
                {localizeCategoryName(locale, item.slug, item.name)}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} locale={locale} />
            ))
          ) : (
            <div className="col-span-full treasure-frame rounded-3xl py-20 text-center text-muted-foreground">
              {q?.trim() ? t.store.noResults : t.store.empty}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
