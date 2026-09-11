import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageTransition, FadeIn } from "@/components/ui/MotionWrapper";
import { Clock, Shield, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartButton } from "./AddToCartButton";

export const revalidate = 60;

export default async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  const slugDecoded = decodeURIComponent(params.slug);

  const product = await prisma.product.findUnique({
    where: { slug: slugDecoded },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
      status: "ACTIVE",
    },
    take: 3,
  });

  let features: string[] = [];
  try {
    if (product.features) {
      const parsed = JSON.parse(product.features);
      features = Array.isArray(parsed) ? parsed : [product.features];
    }
  } catch (error) {
    features = product.features ? [product.features] : [];
  }

  return (
    <PageTransition>
      <div className="pt-24">
        <FadeIn className="px-6 md:px-10 py-6">
          <Link href="/store" className="inline-flex items-center text-muted-foreground hover:text-gold-deep text-[11px] tracking-[0.2em] uppercase">
            <ArrowRight className="ml-2 w-4 h-4" />
            الخزينة
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 mb-20">
          <div className="relative min-h-[70vh] velvet-well">
            {product.image ? (
              <Image 
                src={product.image} 
                alt={product.title} 
                fill 
                className="object-cover"
                priority
              />
            ) : (
            <div className="absolute inset-0 flex items-center justify-center text-pearl/60 font-display text-2xl">أثر</div>
            )}
            
            {/* Badges */}
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              {product.isPopular && (
                <div className="bg-gold text-truffle text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                  الأكثر طلباً
                </div>
              )}
              {product.deliveryType === "INSTANT" && (
                <div className="bg-powder text-truffle text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                  شحن سريع
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center px-6 py-12 lg:px-14 bg-pearl">
            {product.category && (
              <div className="text-gold text-sm font-bold tracking-[0.2em] uppercase mb-3">{product.category}</div>
            )}
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">{product.title}</h1>
            
            <div className="flex items-end gap-4 mb-6 pb-6 border-b border-gold/25">
              <span className="text-4xl font-bold gold-text">{product.price} ج.م</span>
              {product.comparePrice && (
                <span className="text-xl text-muted-foreground line-through mb-1">{product.comparePrice} ج.م</span>
              )}
            </div>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {product.duration && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
                  <Clock className="text-gold-deep w-6 h-6" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">المدة</div>
                    <div className="font-bold">{product.duration}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
                <Shield className="text-gold-deep w-6 h-6" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">الضمان</div>
                  <div className="font-bold">ضمان كامل</div>
                </div>
              </div>
            </div>

            {/* Interaction */}
            <AddToCartButton product={product} />

            <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-center text-sm text-muted-foreground gap-2">
              <Zap className="w-4 h-4 text-gold" />
              تأكيد الدفع عبر انستاباي، ثم الشحن بتغليف فاخر حتى بابك.
            </div>
          </div>
        </div>

        {/* Full Description & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
          <FadeIn className="lg:col-span-2 space-y-8">
            <h2 className="font-display text-2xl font-bold border-b border-border pb-4">تفاصيل المنتج الكاملة</h2>
            <div className="prose max-w-none text-muted-foreground leading-loose">
              {product.fullDescription || "لا توجد تفاصيل إضافية لهذا المنتج."}
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="lg:col-span-1">
            <div className="border-t border-gold/30 pt-8 sticky top-32">
              <h3 className="text-xl font-bold mb-6">المميزات الأساسية</h3>
              {features.length > 0 ? (
                <ul className="space-y-4">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground">
                      <CheckCircle2 className="text-gold-deep w-5 h-5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">لا توجد مميزات مسجلة.</p>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-display text-3xl px-6 md:px-10 py-10">قد يعجبك أيضاً</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-10 pb-16">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
