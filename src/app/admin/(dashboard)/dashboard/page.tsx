import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingCart, ShoppingBag, Users, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/MotionWrapper";

export default async function AdminDashboardPage() {
  // Fetch stats concurrently
  const [
    totalOrders,
    totalRevenueResult,
    totalProducts,
    pendingOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "COMPLETED" } // Only count completed for revenue
    }),
    prisma.product.count(),
    prisma.order.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const totalRevenue = totalRevenueResult._sum.total || 0;
  const pendingCount = await prisma.order.count({ where: { status: "PENDING_REVIEW" } });

  const stats = [
    { title: "إجمالي الإيرادات", value: `${totalRevenue} ج.م`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "إجمالي الطلبات", value: totalOrders, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "الطلبات المعلقة", value: pendingCount, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "المنتجات", value: totalProducts, icon: ShoppingBag, color: "text-powder", bg: "bg-powder/15" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">نظرة عامة</h1>
          <p className="text-muted-foreground">ملخص أداء المتجر والطلبات الأخيرة.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <FadeIn key={idx} delay={idx * 0.1}>
            <div className="treasure-frame rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-muted-foreground font-medium mb-1">{stat.title}</h3>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Recent Pending Orders */}
      <div className="treasure-frame rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold">طلبات بحاجة للمراجعة</h2>
          </div>
          <Link href="/admin/orders" className="text-sm font-medium text-accent hover:underline">
            عرض كل الطلبات
          </Link>
        </div>
        
        {pendingOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {pendingOrders.map(order => (
              <div key={order.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/30 transition-colors">
                <div>
                  <div className="font-mono text-sm text-muted-foreground mb-1">{order.orderId}</div>
                  <div className="font-bold text-lg mb-1">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">التاريخ: {new Date(order.createdAt).toLocaleString('ar-EG')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent text-xl mb-2">{order.total} ج.م</div>
                  <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center bg-background border border-border rounded-lg px-4 py-2 text-sm font-medium hover:text-accent hover:border-accent transition-colors">
                    مراجعة الطلب
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 opacity-50" />
            </div>
            <p>لا يوجد طلبات معلقة بانتظار المراجعة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
}
