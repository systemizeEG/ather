import { prisma } from "@/lib/prisma";

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
    return await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        ...(opts?.category ? { category: { slug: opts.category, isActive: true } } : {}),
        ...(opts?.q
          ? {
              OR: [
                { title: { contains: opts.q, mode: "insensitive" } },
                { shortDescription: { contains: opts.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("listActiveProducts", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        packages: {
          where: { isActive: true },
          orderBy: { quantity: "asc" },
        },
      },
    });
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
