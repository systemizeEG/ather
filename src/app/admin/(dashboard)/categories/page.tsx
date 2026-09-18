import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./CategoryManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
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
      <AdminPageHeader title={t.admin.categoriesTitle} description={t.admin.categoriesDesc} />
      <CategoryManager categories={categories} query={q} />
    </div>
  );
}
