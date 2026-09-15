"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireCandidate } from "@/lib/auth-guards";
import { COUPON_TYPES, TARGET_TYPES, USER_ROLES } from "@/lib/constants";
import { getCandidatePerformance, getCandidatePerformanceByUserId } from "@/lib/candidate-performance";

function parseDateInput(value: string | null, endOfDay = false) {
  if (!value) return null;
  return new Date(endOfDay ? `${value}T23:59:59` : `${value}T00:00:00`);
}

function parseCandidateForm(formData: FormData, { requirePassword }: { requirePassword: boolean }) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  const password = (formData.get("password") as string) || "";
  const couponCode = ((formData.get("couponCode") as string) || "").trim().toUpperCase();
  const percentage = parseFloat(formData.get("percentage") as string);
  const maxUsesRaw = formData.get("maxUses") as string;
  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw, 10) : null;
  const expiryDate = parseDateInput(formData.get("expiryDate") as string, true);
  const targetType = (formData.get("targetType") as string) || TARGET_TYPES.ORDERS;
  const targetValue = parseFloat(formData.get("targetValue") as string);
  const startDate = parseDateInput(formData.get("startDate") as string);
  const endDate = parseDateInput(formData.get("endDate") as string, true);
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  if (!name) return { error: "اسم المرشح مطلوب" };
  if (!email) return { error: "البريد الإلكتروني مطلوب" };
  if (requirePassword && password.length < 6) return { error: "كلمة المرور يجب ألا تقل عن 6 أحرف" };
  if (!requirePassword && password && password.length < 6) return { error: "كلمة المرور يجب ألا تقل عن 6 أحرف" };
  if (!couponCode) return { error: "كود الخصم مطلوب" };
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return { error: "نسبة الخصم غير صالحة" };
  if (targetType !== TARGET_TYPES.ORDERS && targetType !== TARGET_TYPES.REVENUE) return { error: "نوع الهدف غير صالح" };
  if (!Number.isFinite(targetValue) || targetValue < 0) return { error: "قيمة الهدف غير صالحة" };
  if (!startDate) return { error: "تاريخ بداية الهدف مطلوب" };
  if (endDate && startDate && endDate < startDate) return { error: "تاريخ نهاية الهدف يجب أن يكون بعد تاريخ البداية" };

  return {
    data: {
      name,
      email,
      phone,
      password,
      couponCode,
      percentage,
      maxUses: maxUses != null && Number.isFinite(maxUses) ? maxUses : null,
      expiryDate,
      targetType,
      targetValue,
      startDate: startDate as Date,
      endDate,
      isActive,
    },
  };
}

export async function createCandidate(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const parsed = parseCandidateForm(formData, { requirePassword: true });
  if ("error" in parsed) return { error: parsed.error };

  const data = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) return { error: "البريد الإلكتروني مسجل بالفعل" };

    const existingCoupon = await prisma.discountCode.findFirst({
      where: { code: { equals: data.couponCode, mode: "insensitive" } },
    });
    if (existingCoupon) return { error: "كود الخصم مستخدم بالفعل" };

    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
          role: USER_ROLES.CANDIDATE,
        },
      });

      const coupon = await tx.discountCode.create({
        data: {
          code: data.couponCode,
          percentage: data.percentage,
          maxUses: data.maxUses,
          expiryDate: data.expiryDate,
          isActive: data.isActive,
          type: COUPON_TYPES.CANDIDATE,
        },
      });

      await tx.candidateProfile.create({
        data: {
          userId: user.id,
          couponId: coupon.id,
          targetType: data.targetType,
          targetValue: data.targetValue,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });
    });

    revalidatePath("/admin/candidates");
    revalidatePath("/admin/discount-codes");
    return { success: true };
  } catch (error) {
    console.error("Error creating candidate:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return { error: "بيانات المرشح أو الكود مستخدمة بالفعل" };
    }
    return { error: "فشل إنشاء المرشح" };
  }
}

export async function updateCandidate(id: string, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const parsed = parseCandidateForm(formData, { requirePassword: false });
  if ("error" in parsed) return { error: parsed.error };
  const data = parsed.data;

  try {
    const profile = await prisma.candidateProfile.findUnique({
      where: { id },
      include: { user: true, coupon: true },
    });
    if (!profile) return { error: "المرشح غير موجود" };

    if (data.email !== profile.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) return { error: "البريد الإلكتروني مسجل بالفعل" };
    }

    if (data.couponCode.toLowerCase() !== profile.coupon.code.toLowerCase()) {
      const existingCoupon = await prisma.discountCode.findFirst({
        where: { code: { equals: data.couponCode, mode: "insensitive" } },
      });
      if (existingCoupon) return { error: "كود الخصم مستخدم بالفعل" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
        },
      });

      await tx.discountCode.update({
        where: { id: profile.couponId },
        data: {
          code: data.couponCode,
          percentage: data.percentage,
          maxUses: data.maxUses,
          expiryDate: data.expiryDate,
          isActive: data.isActive,
          type: COUPON_TYPES.CANDIDATE,
        },
      });

      await tx.candidateProfile.update({
        where: { id },
        data: {
          targetType: data.targetType,
          targetValue: data.targetValue,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });
    });

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${id}`);
    revalidatePath("/admin/discount-codes");
    revalidatePath("/candidate");
    return { success: true };
  } catch (error) {
    console.error("Error updating candidate:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return { error: "بيانات المرشح أو الكود مستخدمة بالفعل" };
    }
    return { error: "فشل تحديث المرشح" };
  }
}

export async function toggleCandidate(id: string, isActive: boolean) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { id } });
    if (!profile) return { error: "المرشح غير موجود" };

    await prisma.$transaction([
      prisma.candidateProfile.update({ where: { id }, data: { isActive } }),
      prisma.discountCode.update({ where: { id: profile.couponId }, data: { isActive } }),
    ]);

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${id}`);
    revalidatePath("/admin/discount-codes");
    return { success: true };
  } catch {
    return { error: "فشل تحديث حالة المرشح" };
  }
}

export async function getAdminCandidatePerformance(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const performance = await getCandidatePerformance(id);
  if (!performance) return { error: "المرشح غير موجود" };
  return { success: true, performance };
}

export async function getMyCandidateProfile() {
  const user = await requireCandidate();
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
    include: { coupon: true, user: true },
  });
  if (!profile) return null;
  return profile;
}

export async function getMyCandidatePerformance() {
  const user = await requireCandidate();
  const performance = await getCandidatePerformanceByUserId(user.id);
  return performance;
}

export async function getMyCandidateOrders() {
  const user = await requireCandidate();
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
    include: { coupon: true },
  });
  if (!profile) return [];

  return prisma.order.findMany({
    where: {
      discountCode: { equals: profile.coupon.code, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderId: true,
      createdAt: true,
      total: true,
      discountAmount: true,
      status: true,
    },
  });
}
