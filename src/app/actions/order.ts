"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function createOrder(data: {
  orderId: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  notes?: string;
  subtotal: number;
  total: number;
  discountCode?: string | null;
  discountAmount?: number;
  paymentMethod: string;
  paymentScreenshot: string;
  items: Array<{
    productId: string;
    titleSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    packageId?: string | null;
    packageName?: string | null;
    packageQuantity?: number | null;
  }>;
}) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = session?.user?.id;
    const sessionRole = session?.user?.role;

    let validUserId = null;
    if (sessionUserId && sessionRole === USER_ROLES.CUSTOMER) {
      const userExists = await prisma.user.findUnique({ where: { id: sessionUserId } });
      if (userExists) validUserId = sessionUserId;
    }

    const result = await prisma.$transaction(async (tx) => {
      const resolvedItems = [];

      for (const item of data.items) {
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const product = item.productId
          ? await tx.product.findUnique({ where: { id: item.productId } })
          : null;

        let packageRecord = null;
        if (item.packageId) {
          packageRecord = await tx.productPackage.findUnique({ where: { id: item.packageId } });
          if (packageRecord && product && packageRecord.productId !== product.id) {
            packageRecord = null;
          }
          if (packageRecord && !packageRecord.isActive) {
            throw new Error("الباقة المختارة غير متاحة");
          }
        }

        const unitPrice = packageRecord
          ? packageRecord.price
          : product
            ? product.price
            : item.priceSnapshot;

        resolvedItems.push({
          productId: product ? product.id : null,
          packageId: packageRecord ? packageRecord.id : null,
          titleSnapshot: product?.title || item.titleSnapshot,
          priceSnapshot: unitPrice,
          quantity,
          packageNameSnapshot: packageRecord?.name || item.packageName || null,
          packageQuantitySnapshot: packageRecord?.quantity || item.packageQuantity || null,
        });
      }

      const subtotal = round2(
        resolvedItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0)
      );

      let discountAmount = 0;
      let discountCode: string | null = null;

      if (data.discountCode) {
        const discount = await tx.discountCode.findFirst({
          where: {
            code: { equals: data.discountCode.trim(), mode: "insensitive" },
          },
          include: { candidateProfile: true },
        });

        const now = new Date();
        const usable =
          discount &&
          discount.isActive &&
          (!discount.expiryDate || now <= discount.expiryDate) &&
          (!discount.maxUses || discount.usedCount < discount.maxUses) &&
          (!discount.candidateProfile || discount.candidateProfile.isActive);

        if (usable && discount) {
          discountCode = discount.code;
          discountAmount = round2((subtotal * discount.percentage) / 100);
          await tx.discountCode.update({
            where: { id: discount.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      const total = round2(Math.max(0, subtotal - discountAmount));

      return tx.order.create({
        data: {
          userId: validUserId,
          orderId: data.orderId,
          customerName: data.customerName,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
          notes: data.notes,
          subtotal,
          total,
          discountCode,
          discountAmount,
          paymentMethod: data.paymentMethod,
          paymentScreenshot: data.paymentScreenshot,
          status: "PENDING_REVIEW",
          items: {
            create: resolvedItems,
          },
        },
      });
    });

    return { success: true, orderId: result.orderId };
  } catch (error: any) {
    console.error("Order Creation Detailed Error:");
    console.error(error);
    if (error.code) console.error("Prisma Code:", error.code);
    if (error.meta) console.error("Prisma Meta:", error.meta);
    if (error.message) console.error("Message:", error.message);
    return { success: false, error: "فشل في إنشاء الطلب", details: error.message };
  }
}

export async function getStoreSettings() {
  const settings = await prisma.settings.findFirst();
  return settings;
}
