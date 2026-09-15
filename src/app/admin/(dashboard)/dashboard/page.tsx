import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingCart, ShoppingBag, Clock, Plus, Tags, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboardPage() {
  const [totalOrders, totalRevenueResult, totalProducts, pendingCount, pendingOrders, categoryCount] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "COMPLETED" },
      }),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.order.findMany({
        where: { status: "PENDING_REVIEW" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.category.count(),
    ]);

  const totalRevenue = totalRevenueResult._sum.total || 0;

  const stats = [
    { title: "بانتظار المراجعة", value: pendingCount, href: "/admin/orders", icon: Clock, tone: "text-orange-600 bg-orange-500/10" },
    { title: "المبيعات المكتملة", value: `${totalRevenue} ج.م`, href: "/admin/orders", icon: DollarSign, tone: "text-green-600 bg-green-500/10" },
    { title: "كل الطلبات", value: totalOrders, href: "/admin/orders", icon: ShoppingCart, tone: "text-blue-600 bg-blue-500/10" },
    { title: "المنتجات", value: totalProducts, href: "/admin/products", icon: ShoppingBag, tone: "text-gold-deep bg-gold/15" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <AdminPageHeader
        title="أهلاً بك"
        description="ابدأ من الطلبات المعلقة أو أضف منتجاً جديداً."
        actions={
          <>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="w-4 h-4 ml-1.5" /> منتج جديد
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline">
                <Tags className="w-4 h-4 ml-1.5" /> الأقسام
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-card border border-gold/20 rounded-2xl p-4 sm:p-5 hover:border-gold/50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.tone}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">{stat.title}</div>
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
          </Link>
        ))}
      </div>

      <AdminPanel>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold">طلبات تحتاج مراجعة</h2>
            <p className="text-sm text-muted-foreground">{pendingCount} طلب بانتظار تأكيد الدفع</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-medium text-gold-deep inline-flex items-center gap-1">
            الكل <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {pendingOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.orderId} · {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <div className="font-bold">{order.total} ج.م</div>
                  <div className="text-xs text-orange-600 font-medium">مراجعة</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-muted-foreground">لا توجد طلبات معلّقة حالياً.</div>
        )}
      </AdminPanel>

      <p className="text-sm text-muted-foreground text-center">
        لديك {categoryCount} قسم في المتجر.
      </p>
    </div>
  );
}
