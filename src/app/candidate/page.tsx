import { getMyCandidatePerformance, getMyCandidateProfile } from "@/app/actions/candidates";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TARGET_TYPES } from "@/lib/constants";

export default async function CandidateDashboardPage() {
  const [profile, performance] = await Promise.all([
    getMyCandidateProfile(),
    getMyCandidatePerformance(),
  ]);

  if (!profile || !performance) {
    return (
      <div className="max-w-3xl mx-auto treasure-frame rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">لا يوجد ملف مرشح مرتبط بحسابك</h1>
        <p className="text-muted-foreground">يرجى التواصل مع الإدارة.</p>
      </div>
    );
  }

  const targetLabel =
    performance.targetType === TARGET_TYPES.REVENUE
      ? `${performance.targetValue} ج.م`
      : `${performance.targetValue} طلب`;
  const achievedLabel =
    performance.targetType === TARGET_TYPES.REVENUE
      ? `${performance.achievedValue} ج.م`
      : `${performance.achievedValue} طلب`;
  const remainingLabel =
    performance.targetType === TARGET_TYPES.REVENUE
      ? `${performance.remainingValue} ج.م`
      : `${performance.remainingValue} طلب`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">مرحباً، {profile.user.name}</h1>
        <p className="text-muted-foreground">متابعة كوبونك وتقدمك نحو الهدف.</p>
      </div>

      {!performance.isActive && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-2xl p-4">
          حسابك غير نشط حالياً. يمكنك مراجعة إحصائياتك النهائية لكن الكوبون قد لا يقبل في الطلبات الجديدة.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">الكوبون</div>
          <div className="text-3xl font-black tracking-wide">{performance.couponCode}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">الهدف</div>
          <div className="text-3xl font-bold">{targetLabel}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">المكتمل</div>
          <div className="text-3xl font-bold">{achievedLabel}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">المتبقي</div>
          <div className="text-3xl font-bold">{remainingLabel}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">الإيرادات المحققة</div>
          <div className="text-3xl font-bold">{performance.generatedRevenue} ج.م</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">الخصم</div>
          <div className="text-3xl font-bold">{profile.coupon.percentage}%</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">التقدم</h2>
          <span className="text-2xl font-black text-gold-deep">{performance.progressPercentage}%</span>
        </div>
        <ProgressBar value={performance.progressPercentage} className="h-3" />
        <p className="text-sm text-muted-foreground">
          الشريط البصري يتوقف عند 100%، بينما النسبة الرقمية تعرض التحقيق الفعلي حتى لو تجاوز الهدف.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">بداية الهدف</div>
          <div className="font-bold">{performance.startDate.toLocaleDateString("ar-EG")}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">نهاية الهدف</div>
          <div className="font-bold">
            {performance.endDate ? performance.endDate.toLocaleDateString("ar-EG") : "بدون تاريخ نهاية"}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">الأيام المتبقية</div>
          <div className="font-bold">
            {performance.daysRemaining == null
              ? "—"
              : performance.daysRemaining < 0
                ? "انتهت الفترة"
                : `${performance.daysRemaining} يوم`}
          </div>
        </div>
      </div>
    </div>
  );
}
