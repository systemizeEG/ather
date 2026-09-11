"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  }>;
}) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as any)?.id;

    // Validate if the user actually exists in the DB (prevents FK error if DB was reset)
    let validUserId = null;
    if (sessionUserId) {
      const userExists = await prisma.user.findUnique({ where: { id: sessionUserId } });
      if (userExists) validUserId = sessionUserId;
    }

    // Validate if products still exist
    const validItems = await Promise.all(
      data.items.map(async (item) => {
        const productExists = await prisma.product.findUnique({ where: { id: item.productId } });
        return {
          productId: productExists ? item.productId : null,
          titleSnapshot: item.titleSnapshot,
          priceSnapshot: item.priceSnapshot,
          quantity: item.quantity,
        };
      })
    );

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          userId: validUserId,
          orderId: data.orderId,
          customerName: data.customerName,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
          notes: data.notes,
          subtotal: data.subtotal,
          total: data.total,
          discountCode: data.discountCode,
          discountAmount: data.discountAmount || 0,
          paymentMethod: data.paymentMethod,
          paymentScreenshot: data.paymentScreenshot,
          status: "PENDING_REVIEW", 
          items: {
            create: validItems,
          },
        },
      });

      // 2. Increment discount usage if applicable
      if (data.discountCode) {
        const discount = await tx.discountCode.findFirst({
          where: {
            code: { equals: data.discountCode.trim(), mode: "insensitive" },
          },
        });
        if (discount) {
          await tx.discountCode.update({
            where: { id: discount.id },
            data: { usedCount: { increment: 1 } }
          });
        }
      }

      return order;
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
