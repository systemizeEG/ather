import { listActiveCategories, listActiveProducts } from "@/lib/catalog";
import Link from "next/link";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;
export const metadata = {
  title: "الخزينة",
  description: "كنوز أثر: مجوهرات، حقائب، وإكسسوارات في خزينة واحدة.",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [categories, products] = await Promise.all([
    listActiveCategories(),
    listActiveProducts({ q, category }),
  ]);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-32 pb-20">
        <FadeIn className="mb-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-3">The Vault</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">الخزينة</h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            مجموعة منتقاة من الإكسسوارات — كل قطعة في علبتها.
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
              الكل
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                href={`/category/${item.slug}`}
                className={`px-4 py-2 rounded-full text-sm border ${
                  category === item.slug ? "bg-gold text-truffle border-gold" : "border-gold/30 hover:border-gold"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
          ) : (
            <div className="col-span-full treasure-frame rounded-3xl py-20 text-center text-muted-foreground">
              الخزينة قيد التجهيز
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
