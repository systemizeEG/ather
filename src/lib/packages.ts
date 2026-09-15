import { Prisma } from "@prisma/client";

export type PackageDraft = {
  id?: string;
  name: string;
  description?: string | null;
  quantity: number;
  price: number;
  compareAtPrice?: number | null;
  isActive: boolean;
};

export function parsePackagesJson(raw: string | null): { packages?: PackageDraft[]; error?: string } {
  if (!raw) return { packages: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { error: "بيانات الباقات غير صالحة" };
    const packages: PackageDraft[] = [];
    for (const item of parsed) {
      const name = String(item.name || "").trim();
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      if (!name) return { error: "اسم الباقة مطلوب" };
      if (!Number.isInteger(quantity) || quantity < 1) return { error: "كمية الباقة يجب أن تكون 1 أو أكثر" };
      if (!Number.isFinite(price) || price < 0) return { error: "سعر الباقة غير صالح" };
      packages.push({
        id: item.id || undefined,
        name,
        description: item.description ? String(item.description) : null,
        quantity,
        price,
        compareAtPrice:
          item.compareAtPrice === "" || item.compareAtPrice == null
            ? null
            : Number(item.compareAtPrice),
        isActive: item.isActive !== false,
      });
      if (packages[packages.length - 1].compareAtPrice != null && Number.isNaN(packages[packages.length - 1].compareAtPrice)) {
        return { error: "السعر الأصلي للباقة غير صالح" };
      }
    }
    return { packages };
  } catch {
    return { error: "تعذر قراءة بيانات الباقات" };
  }
}

export async function syncProductPackages(
  tx: Prisma.TransactionClient,
  productId: string,
  incoming: PackageDraft[]
) {
  const existing = await tx.productPackage.findMany({
    where: { productId },
    include: { _count: { select: { orderItems: true } } },
  });

  const incomingIds = new Set(incoming.filter((pkg) => pkg.id).map((pkg) => pkg.id as string));

  for (const pkg of existing) {
    if (!incomingIds.has(pkg.id)) {
      if (pkg._count.orderItems > 0) {
        await tx.productPackage.update({
          where: { id: pkg.id },
          data: { isActive: false },
        });
      } else {
        await tx.productPackage.delete({ where: { id: pkg.id } });
      }
    }
  }

  for (const pkg of incoming) {
    const data = {
      name: pkg.name,
      description: pkg.description || null,
      quantity: pkg.quantity,
      price: pkg.price,
      compareAtPrice: pkg.compareAtPrice ?? null,
      isActive: pkg.isActive,
    };

    if (pkg.id && existing.some((item) => item.id === pkg.id)) {
      await tx.productPackage.update({
        where: { id: pkg.id },
        data,
      });
    } else {
      await tx.productPackage.create({
        data: { ...data, productId },
      });
    }
  }
}
