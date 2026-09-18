import { getMyCandidatePerformance, getMyCandidateProfile } from "@/app/actions/candidates";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { dateLocale, formatMoneyAmount, formatTargetValue, getRequestLocale } from "@/lib/locale";
import { getTranslation } from "@/lib/dictionaries";

export default async function CandidateDashboardPage() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const dateFmt = dateLocale(locale);

  const [profile, performance] = await Promise.all([
    getMyCandidateProfile(),
    getMyCandidatePerformance(),
  ]);

  if (!profile || !performance) {
    return (
      <div className="max-w-3xl mx-auto treasure-frame rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">{t.candidateDash.noProfile}</h1>
        <p className="text-muted-foreground">{t.candidateDash.noProfileDesc}</p>
      </div>
    );
  }

  const targetLabel = formatTargetValue(performance.targetValue, performance.targetType, locale);
  const achievedLabel = formatTargetValue(performance.achievedValue, performance.targetType, locale);
  const remainingLabel = formatTargetValue(performance.remainingValue, performance.targetType, locale);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {t.candidateDash.welcome.replace("{name}", profile.user.name)}
        </h1>
        <p className="text-muted-foreground">{t.candidateDash.followProgress}</p>
      </div>

      {!performance.isActive && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-2xl p-4">
          {t.candidateDash.inactiveWarning}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.coupon}</div>
          <div className="text-3xl font-black tracking-wide">{performance.couponCode}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.target}</div>
          <div className="text-3xl font-bold">{targetLabel}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.achieved}</div>
          <div className="text-3xl font-bold">{achievedLabel}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.remaining}</div>
          <div className="text-3xl font-bold">{remainingLabel}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.revenue}</div>
          <div className="text-3xl font-bold">{formatMoneyAmount(performance.generatedRevenue, locale)}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.discount}</div>
          <div className="text-3xl font-bold">{profile.coupon.percentage}%</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t.candidateDash.progress}</h2>
          <span className="text-2xl font-black text-gold-deep">{performance.progressPercentage}%</span>
        </div>
        <ProgressBar value={performance.progressPercentage} className="h-3" />
        <p className="text-sm text-muted-foreground">{t.candidateDash.progressHint}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.startDate}</div>
          <div className="font-bold">{performance.startDate.toLocaleDateString(dateFmt)}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.endDate}</div>
          <div className="font-bold">
            {performance.endDate ? performance.endDate.toLocaleDateString(dateFmt) : t.candidateDash.noEnd}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-sm text-muted-foreground mb-1">{t.candidateDash.daysRemaining}</div>
          <div className="font-bold">
            {performance.daysRemaining == null
              ? "—"
              : performance.daysRemaining < 0
                ? t.candidateDash.periodEnded
                : t.candidateDash.days.replace("{count}", String(performance.daysRemaining))}
          </div>
        </div>
      </div>
    </div>
  );
}
