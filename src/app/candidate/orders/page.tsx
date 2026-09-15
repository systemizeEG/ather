import { getMyCandidateOrders } from "@/app/actions/candidates";

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT_REVIEW: "مراجعة الدفع",
  PENDING_REVIEW: "مراجعة الدفع",
  PROCESSING: "قيد التجهيز",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export default async function CandidateOrdersPage() {
  const orders = await getMyCandidateOrders();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">الطلبات عبر كوبونك</h1>
        <p className="text-muted-foreground">بيانات مختصرة للطلبات التي استخدمت كود الخصم الخاص بك.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-muted/40 text-sm text-muted-foreground">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">قيمة الطلب</th>
                <th className="px-6 py-4">قيمة الخصم</th>
                <th className="px-6 py-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-mono font-bold">{order.orderId}</td>
                  <td className="px-6 py-4">{order.createdAt.toLocaleDateString("ar-EG")}</td>
                  <td className="px-6 py-4 font-bold">{order.total} ج.م</td>
                  <td className="px-6 py-4">{order.discountAmount || 0} ج.م</td>
                  <td className="px-6 py-4">{statusLabels[order.status] || order.status}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد طلبات حتى الآن.
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
