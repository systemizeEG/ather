import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Plus, Edit, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
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
        title="المنتجات"
        description="أضف منتجات جديدة أو عدّل المنتجات الحالية."
        actions={
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 ml-1.5" /> إضافة منتج
            </Button>
          </Link>
        }
      />

      <form className="flex flex-wrap items-center gap-3 mb-5">
        <label className="text-sm font-medium">تصفية حسب القسم</label>
        <select
          name="category"
          defaultValue={category || ""}
          className="bg-background border border-border rounded-xl px-4 py-2"
        >
          <option value="">كل الأقسام</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">تصفية</Button>
      </form>

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-muted/40 text-muted-foreground text-sm">
              <tr>
                <th className="px-6 py-3">المنتج</th>
                <th className="px-6 py-3">القسم</th>
                <th className="px-6 py-3">السعر</th>
                <th className="px-6 py-3">الحالة</th>
                <th className="px-6 py-3 text-center">الإجراءات</th>
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
                        {product.category?.name || "بدون قسم"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg">{product.price} ج.م</div>
                    </td>
                    <td className="px-6 py-4">
                      {product.status === "ACTIVE" ? (
                        <div className="flex items-center gap-1.5 text-green-500 font-medium text-sm">
                          <CheckCircle className="w-4 h-4" /> مفعل
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500 font-medium text-sm">
                          <XCircle className="w-4 h-4" /> غير مفعل
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-9 px-3">
                            <Edit className="w-4 h-4 ml-1.5" /> تعديل
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    لا يوجد منتجات مضمّنة حتى الآن.
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
