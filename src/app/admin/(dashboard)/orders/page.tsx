import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Eye, Clock, CheckCircle2, Package, XCircle } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT_REVIEW":
      case "PENDING_REVIEW":
        return <span className="flex justify-center items-center gap-1.5 text-xs font-bold bg-orange-500/10 text-orange-500 py-1 px-3 border border-orange-500/20 rounded-md"><Clock className="w-3.5 h-3.5" /> مراجعة الدفع</span>;
      case "PROCESSING":
        return <span className="flex justify-center items-center gap-1.5 text-xs font-bold bg-blue-500/10 text-blue-500 py-1 px-3 border border-blue-500/20 rounded-md"><Package className="w-3.5 h-3.5" /> قيد التجهيز</span>;
      case "COMPLETED":
        return <span className="flex justify-center items-center gap-1.5 text-xs font-bold bg-green-500/10 text-green-500 py-1 px-3 border border-green-500/20 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /> مكتمل</span>;
      case "CANCELLED":
        return <span className="flex justify-center items-center gap-1.5 text-xs font-bold bg-red-500/10 text-red-500 py-1 px-3 border border-red-500/20 rounded-md"><XCircle className="w-3.5 h-3.5" /> ملغي</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground">عرض جميع الطلبات ومراجعة إيصالات الدفع لتحديث حالتها.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right bg-background">
            <thead className="bg-muted text-muted-foreground text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tr-lg w-32">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4 text-center">التاريخ</th>
                <th className="px-6 py-4 text-center">الإجمالي</th>
                <th className="px-6 py-4 text-center w-40">الحالة</th>
                <th className="px-6 py-4 text-center rounded-tl-lg w-20">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground mt-1" dir="ltr">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-accent">{order.total} ج.م</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusDisplay(order.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="p-2 border border-border rounded-lg bg-background hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors group">
                          <Eye className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    لا يوجد طلبات حالياً.
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
