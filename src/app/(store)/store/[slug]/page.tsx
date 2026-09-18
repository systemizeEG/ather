import { getProductBySlug, listRelatedProducts } from "@/lib/catalog";
import { notFound } from "next/navigation";
import { StoreImage } from "@/components/ui/StoreImage";
import { PageTransition } from "@/components/ui/MotionWrapper";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartButton } from "./AddToCartButton";

export const revalidate = 60;

export default async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slugDecoded = decodeURIComponent(params.slug);

  const product = await getProductBySlug(slugDecoded);

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const relatedProducts = await listRelatedProducts(product.id, product.categoryId, 3);

  let features: string[] = [];
  try {
    if (product.features) {
      const parsed = JSON.parse(product.features);
      features = Array.isArray(parsed) ? parsed : [product.features];
    }
  } catch {
    features = product.features ? [product.features] : [];
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <Link
          href={product.category?.isActive ? `/category/${product.category.slug}` : "/store"}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gold-deep mb-8"
        >
          <ArrowRight className="ml-2 w-4 h-4" />
          {product.category?.isActive ? product.category.name : "الخزينة"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-start">
          <div className="relative aspect-[4/5] sm:aspect-[5/6] velvet-well rounded-3xl overflow-hidden">
            {product.image ? (
              <StoreImage
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-pearl/60 font-display text-2xl">
                أثر
              </div>
            )}
            {product.isPopular && (
              <div className="absolute top-4 right-4 bg-gold text-truffle text-xs font-bold px-3 py-1.5 rounded-full">
                الأكثر طلباً
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-32">
            {product.category?.isActive && (
              <Link
                href={`/category/${product.category.slug}`}
                className="text-gold text-xs font-bold tracking-[0.22em] uppercase mb-3 inline-block"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {product.title}
            </h1>
            {product.shortDescription && (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                title: product.title,
                shortDescription: product.shortDescription,
                image: product.image,
                price: product.price,
                comparePrice: product.comparePrice,
                category: product.category
                  ? { name: product.category.name, slug: product.category.slug }
                  : null,
              }}
              packages={product.packages.map((pkg) => ({
                id: pkg.id,
                name: pkg.name,
                description: pkg.description,
                quantity: pkg.quantity,
                price: pkg.price,
                compareAtPrice: pkg.compareAtPrice,
              }))}
            />

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 bg-card border border-gold/20 rounded-full px-3 py-1.5">
                <Shield className="w-3.5 h-3.5 text-gold-deep" />
                ضمان كامل
              </span>
              {product.duration && (
                <span className="inline-flex items-center gap-1.5 bg-card border border-gold/20 rounded-full px-3 py-1.5">
                  المدة: {product.duration}
                </span>
              )}
              {product.deliveryType === "INSTANT" && (
                <span className="inline-flex items-center gap-1.5 bg-card border border-gold/20 rounded-full px-3 py-1.5">
                  شحن سريع
                </span>
              )}
            </div>
          </div>
        </div>

        {(product.fullDescription || features.length > 0) && (
          <div className="mt-16 pt-10 border-t border-gold/20 grid grid-cols-1 md:grid-cols-3 gap-10">
            {product.fullDescription && (
              <div className="md:col-span-2">
                <h2 className="font-display text-2xl mb-4">التفاصيل</h2>
                <p className="text-muted-foreground leading-loose whitespace-pre-line">
                  {product.fullDescription}
                </p>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">المميزات</h2>
                <ul className="space-y-3 text-muted-foreground">
                  {features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl mb-6">قد يعجبك أيضاً</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
