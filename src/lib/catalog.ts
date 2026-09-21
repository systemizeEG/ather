import { prisma } from "@/lib/prisma";
import { productMatchesSearch } from "@/lib/catalog-i18n";

export async function listLiveCategories(take?: number) {
  try {
    return await prisma.category.findMany({
      where: { isActive: true, slug: { not: "uncategorized" } },
      orderBy: { name: "asc" },
      ...(take ? { take } : {}),
    });
  } catch (error) {
    console.error("listLiveCategories", error);
    return [];
  }
}

export async function listActiveCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("listActiveCategories", error);
    return [];
  }
}

export async function listFeaturedProducts(take = 6) {
  try {
    return await prisma.product.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      include: { category: true },
      take,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("listFeaturedProducts", error);
    return [];
  }
}

export async function listActiveProducts(opts?: { q?: string; category?: string }) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        ...(opts?.category ? { category: { slug: opts.category, isActive: true } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    if (!opts?.q?.trim()) return products;
    return products.filter((product) => productMatchesSearch(product, opts.q));
  } catch (error) {
    console.error("listActiveProducts", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  const include = {
    category: true,
    packages: {
      where: { isActive: true },
      orderBy: { quantity: "asc" as const },
    },
  };

  const candidates = Array.from(
    new Set(
      [
        slug,
        slug.trim(),
        slug.trim().toLowerCase().replace(/\s+/g, "-"),
        slug.trim().replace(/\s+/g, "-"),
      ].filter(Boolean)
    )
  );

  try {
    for (const candidate of candidates) {
      const bySlug = await prisma.product.findUnique({
        where: { slug: candidate },
        include,
      });
      if (bySlug) return bySlug;
    }

    const trimmed = slug.trim();
    const byLooseMatch = await prisma.product.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { slug: { equals: trimmed, mode: "insensitive" } },
          { slug: { contains: trimmed, mode: "insensitive" } },
          { title: { equals: trimmed, mode: "insensitive" } },
          { title: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      include,
    });
    return byLooseMatch;
  } catch (error) {
    console.error("getProductBySlug", error);
    return null;
  }
}

export async function listRelatedProducts(productId: string, categoryId: string | null, take = 3) {
  try {
    return await prisma.product.findMany({
      where: {
        categoryId: categoryId || undefined,
        id: { not: productId },
        status: "ACTIVE",
      },
      include: { category: true },
      take,
    });
  } catch (error) {
    console.error("listRelatedProducts", error);
    return [];
  }
}
