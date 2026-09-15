import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { QUALIFYING_ORDER_STATUSES, TARGET_TYPES } from "@/lib/constants";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type CandidatePerformance = {
  candidateId: string;
  userId: string;
  candidateName: string;
  couponCode: string;
  couponId: string;
  targetType: string;
  targetValue: number;
  achievedValue: number;
  remainingValue: number;
  progressPercentage: number;
  validOrdersCount: number;
  generatedRevenue: number;
  couponUses: number;
  lifetimeValidOrders: number;
  lifetimeRevenue: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  daysRemaining: number | null;
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function getCandidatePerformance(
  candidateId: string,
  db: DbClient = prisma
): Promise<CandidatePerformance | null> {
  const profile = await db.candidateProfile.findUnique({
    where: { id: candidateId },
    include: {
      user: { select: { id: true, name: true } },
      coupon: { select: { id: true, code: true } },
    },
  });

  if (!profile) return null;

  const qualifyingWhere: Prisma.OrderWhereInput = {
    discountCode: { equals: profile.coupon.code, mode: "insensitive" },
    status: { in: [...QUALIFYING_ORDER_STATUSES] },
  };

  const periodWhere: Prisma.OrderWhereInput = {
    ...qualifyingWhere,
    createdAt: {
      gte: profile.startDate,
      ...(profile.endDate ? { lte: profile.endDate } : {}),
    },
  };

  const [periodAgg, lifetimeAgg] = await Promise.all([
    db.order.aggregate({
      where: periodWhere,
      _count: { _all: true },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: qualifyingWhere,
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const validOrdersCount = periodAgg._count._all;
  const generatedRevenue = round2(periodAgg._sum.total || 0);
  const lifetimeValidOrders = lifetimeAgg._count._all;
  const lifetimeRevenue = round2(lifetimeAgg._sum.total || 0);

  const achievedValue =
    profile.targetType === TARGET_TYPES.REVENUE ? generatedRevenue : validOrdersCount;

  const targetValue = profile.targetValue;
  const remainingValue = Math.max(0, round2(targetValue - achievedValue));
  const progressPercentage =
    targetValue <= 0 ? (achievedValue > 0 ? 100 : 0) : round2((achievedValue / targetValue) * 100);

  let daysRemaining: number | null = null;
  if (profile.endDate) {
    const diff = profile.endDate.getTime() - Date.now();
    daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return {
    candidateId: profile.id,
    userId: profile.user.id,
    candidateName: profile.user.name,
    couponCode: profile.coupon.code,
    couponId: profile.coupon.id,
    targetType: profile.targetType,
    targetValue,
    achievedValue,
    remainingValue,
    progressPercentage,
    validOrdersCount,
    generatedRevenue,
    couponUses: validOrdersCount,
    lifetimeValidOrders,
    lifetimeRevenue,
    startDate: profile.startDate,
    endDate: profile.endDate,
    isActive: profile.isActive,
    daysRemaining,
  };
}

export async function getCandidatePerformanceByUserId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;
  return getCandidatePerformance(profile.id);
}
