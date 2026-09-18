import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { ProductCard } from "@/components/product/ProductCard";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";
import { localizeCategoryName, tx } from "@/lib/catalog-i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const category = await prisma.category.findUnique({
    where: { slug: decodeURIComponent(slug) },
  });
  const name = localizeCategoryName(locale, category?.slug, category?.name);
  return {
    title: name || t.store.categoryFallback,
    description: tx(locale, category?.description) || `${t.store.categoryKicker} ${name || ""}`,
  };
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const slugDecoded = decodeURIComponent(slug);
  const locale = await getRequestLocale();
  const t = getTranslation(locale);

  const category = await prisma.category.findUnique({
    where: { slug: slugDecoded },
  });

  if (!category || !category.isActive) notFound();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", categoryId: category.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const categoryName = localizeCategoryName(locale, category.slug, category.name);
  const categoryDescription = tx(locale, category.description);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-32 pb-20">
        <FadeIn className="mb-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-3">{t.store.categoryKicker}</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">{categoryName}</h1>
          {categoryDescription && (
            <p className="text-muted-foreground text-lg max-w-xl">{categoryDescription}</p>
          )}
        </FadeIn>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/store" className="px-4 py-2 rounded-full text-sm border border-gold/30 hover:border-gold">
            {t.store.all}
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className={`px-4 py-2 rounded-full text-sm border ${
                item.id === category.id ? "bg-gold text-truffle border-gold" : "border-gold/30 hover:border-gold"
              }`}
            >
              {localizeCategoryName(locale, item.slug, item.name)}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} locale={locale} />
            ))
          ) : (
            <div className="col-span-full treasure-frame rounded-3xl py-20 text-center text-muted-foreground">
              {t.store.categoryEmpty}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
