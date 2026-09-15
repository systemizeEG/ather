import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const category = await prisma.category.findUnique({
    where: { slug: decodeURIComponent(slug) },
  });
  return {
    title: category?.name || "قسم",
    description: category?.description || `منتجات قسم ${category?.name || ""}`,
  };
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const slugDecoded = decodeURIComponent(slug);

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

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-32 pb-20">
        <FadeIn className="mb-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-3">Category</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground text-lg max-w-xl">{category.description}</p>
          )}
        </FadeIn>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/store" className="px-4 py-2 rounded-full text-sm border border-gold/30 hover:border-gold">
            الكل
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className={`px-4 py-2 rounded-full text-sm border ${
                item.id === category.id ? "bg-gold text-truffle border-gold" : "border-gold/30 hover:border-gold"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
          ) : (
            <div className="col-span-full treasure-frame rounded-3xl py-20 text-center text-muted-foreground">
              لا توجد منتجات في هذا القسم حالياً.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
