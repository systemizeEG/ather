import { prisma } from "@/lib/prisma";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;
export const metadata = {
  title: "الخزينة",
  description: "كنوز أثر: مجوهرات، حقائب، وإكسسوارات في خزينة واحدة.",
};

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

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
