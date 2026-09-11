"use server";

import { prisma } from "@/lib/prisma";

export async function trackOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "لم يتم العثور على طلب بهذا الرقم." };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Order Tracking Error:", error);
    return { success: false, error: "حدث خطأ في النظام." };
  }
}
