import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Plus, Edit, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const { category } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const productWhere = category
    ? ({ category: { id: category } } as Prisma.ProductWhereInput)
    : undefined;

  const products = await prisma.product.findMany({
    where: productWhere,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title={t.admin.productsTitle}
        description={t.admin.productsDesc}
        actions={
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 ms-0 me-1.5" /> {t.admin.addProduct}
            </Button>
          </Link>
        }
      />

      <form className="flex flex-wrap items-center gap-3 mb-5">
        <label className="text-sm font-medium">{t.admin.filterByCategory}</label>
        <select
          name="category"
          defaultValue={category || ""}
          className="bg-background border border-border rounded-xl px-4 py-2"
        >
          <option value="">{t.admin.allCategories}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          {t.admin.filter}
        </Button>
      </form>

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-muted/40 text-muted-foreground text-sm">
              <tr>
                <th className="px-6 py-3">{t.admin.colProduct}</th>
                <th className="px-6 py-3">{t.admin.colCategory}</th>
                <th className="px-6 py-3">{t.admin.colPrice}</th>
                <th className="px-6 py-3">{t.admin.colStatus}</th>
                <th className="px-6 py-3 text-center">{t.admin.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{product.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{product.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-accent/10 text-accent px-3 py-1 rounded-md text-xs font-bold border border-accent/20">
                        {product.category?.name || t.admin.noCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg">
                        {product.price} {t.common.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.status === "ACTIVE" ? (
                        <div className="flex items-center gap-1.5 text-green-500 font-medium text-sm">
                          <CheckCircle className="w-4 h-4" /> {t.admin.published}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500 font-medium text-sm">
                          <XCircle className="w-4 h-4" /> {t.admin.unpublished}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-9 px-3">
                            <Edit className="w-4 h-4 ms-0 me-1.5" /> {t.admin.edit}
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {t.admin.noProducts}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
