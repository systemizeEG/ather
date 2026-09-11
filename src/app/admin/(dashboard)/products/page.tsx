import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة المنتجات</h1>
          <p className="text-muted-foreground">عرض وإضافة وتعديل المنتجات المتاحة في المتجر.</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="glow" size="lg">
            <Plus className="w-5 h-5 ml-2" /> إضــافة منتج جديد
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right bg-background">
            <thead className="bg-muted text-muted-foreground text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tr-lg">المنتج</th>
                <th className="px-6 py-4">القسم</th>
                <th className="px-6 py-4">السعر</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center rounded-tl-lg">الإجراءات</th>
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
                        {product.category || "بدون قسم"}
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
                        <Button variant="destructive" size="sm" className="h-9 px-3">
                          <Trash2 className="w-4 h-4 ml-1.5" /> حذف
                        </Button>
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
      </div>
    </div>
  );
}
