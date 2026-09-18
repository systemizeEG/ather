import { getProductBySlug, listRelatedProducts } from "@/lib/catalog";
import { notFound } from "next/navigation";
import { StoreImage } from "@/components/ui/StoreImage";
import { PageTransition } from "@/components/ui/MotionWrapper";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartButton } from "./AddToCartButton";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";
import { brandWord, localizeFeatures, localizeProduct } from "@/lib/catalog-i18n";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const locale = await getRequestLocale();
  const raw = await getProductBySlug(decodeURIComponent(slug));
  if (!raw || raw.status !== "ACTIVE") {
    return { title: SITE_NAME };
  }
  const product = localizeProduct(locale, raw);
  const description = product.shortDescription || product.fullDescription || SITE_NAME;
  const image = product.image || SITE_OG_IMAGE;
  const url = `${SITE_URL}/store/${product.slug}`;
  return {
    title: product.title,
    description,
    openGraph: {
      title: `${product.title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: image,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export default async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slugDecoded = decodeURIComponent(params.slug);
  const locale = await getRequestLocale();
  const t = getTranslation(locale);

  const rawProduct = await getProductBySlug(slugDecoded);

  if (!rawProduct || rawProduct.status !== "ACTIVE") {
    notFound();
  }

  const product = localizeProduct(locale, rawProduct);
  const relatedProducts = await listRelatedProducts(rawProduct.id, rawProduct.categoryId ?? null, 3);
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const category =
    product.category && typeof product.category === "object" ? product.category : null;
  const packages = Array.isArray(product.packages) ? product.packages : [];

  let features: string[] = [];
  try {
    if (rawProduct.features) {
      const parsed = JSON.parse(rawProduct.features);
      features = Array.isArray(parsed) ? parsed : [rawProduct.features];
    }
  } catch {
    features = rawProduct.features ? [rawProduct.features] : [];
  }
  features = localizeFeatures(locale, features);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <Link
          href={category?.isActive ? `/category/${category.slug}` : "/store"}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-gold-deep mb-8"
        >
          <BackIcon className="me-2 w-4 h-4" />
          {category?.isActive ? category.name : t.product.vault}
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
                {brandWord(locale)}
              </div>
            )}
            {product.isPopular && (
              <div className="absolute top-4 end-4 bg-gold text-truffle text-xs font-bold px-3 py-1.5 rounded-full">
                {t.product.popular}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-32">
            {category?.isActive && (
              <Link
                href={`/category/${category.slug}`}
                className="text-gold text-xs font-bold tracking-[0.22em] uppercase mb-3 inline-block"
              >
                {category.name}
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
                category: category
                  ? { name: category.name || "", slug: category.slug || "" }
                  : null,
              }}
              packages={packages.map((pkg) => ({
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
                {t.product.fullWarranty}
              </span>
              {product.duration && (
                <span className="inline-flex items-center gap-1.5 bg-card border border-gold/20 rounded-full px-3 py-1.5">
                  {t.product.duration}: {product.duration}
                </span>
              )}
              {product.deliveryType === "INSTANT" && (
                <span className="inline-flex items-center gap-1.5 bg-card border border-gold/20 rounded-full px-3 py-1.5">
                  {t.product.fastShipping}
                </span>
              )}
            </div>
          </div>
        </div>

        {(product.fullDescription || features.length > 0) && (
          <div className="mt-16 pt-10 border-t border-gold/20 grid grid-cols-1 md:grid-cols-3 gap-10">
            {product.fullDescription && (
              <div className="md:col-span-2">
                <h2 className="font-display text-2xl mb-4">{t.product.details}</h2>
                <p className="text-muted-foreground leading-loose whitespace-pre-line">
                  {product.fullDescription}
                </p>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">{t.product.features}</h2>
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
            <h2 className="font-display text-2xl mb-6">{t.product.related}</h2>
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
