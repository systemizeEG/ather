import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./CategoryManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const categories = await prisma.category.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <AdminPageHeader
        title="الأقسام"
        description="نظّم منتجات المتجر في أقسام واضحة. الاسم يكفي للبداية."
      />
      <CategoryManager categories={categories} query={q} />
    </div>
  );
}
