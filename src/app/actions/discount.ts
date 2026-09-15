"use server";

import { prisma } from "@/lib/prisma";

export async function validateDiscountCode(code: string) {
  try {
    const normalized = code.trim();
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        code: { equals: normalized, mode: "insensitive" },
      },
      include: {
        candidateProfile: true,
      },
    });

    if (!discountCode) {
      return { error: "كود الخصم غير موجود" };
    }

    if (!discountCode.isActive) {
      return { error: "كود الخصم غير مفعل حالياً" };
    }

    if (discountCode.candidateProfile && !discountCode.candidateProfile.isActive) {
      return { error: "كود الخصم غير مفعل حالياً" };
    }

    if (discountCode.expiryDate && new Date() > discountCode.expiryDate) {
      return { error: "كود الخصم منتهي الصلاحية" };
    }

    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return { error: "كود الخصم وصل للحد الأقصى للإستخدام" };
    }

    return {
      success: true,
      discount: {
        code: discountCode.code,
        percentage: discountCode.percentage,
      }
    };
  } catch (error) {
    console.error("Error validating discount code:", error);
    return { error: "حدث خطأ أثناء التحقق من كود الخصم" };
  }
}
