"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const fullDescription = formData.get("fullDescription") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string);
  const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
  const image = formData.get("image") as string;
  const deliveryType = formData.get("deliveryType") as any;
  const duration = formData.get("duration") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const isPopular = formData.get("isPopular") === "on";

  try {
    await prisma.product.create({
      data: {
        title,
        slug,
        shortDescription,
        fullDescription,
        category,
        price,
        comparePrice,
        image,
        deliveryType,
        duration,
        status: "ACTIVE",
        isFeatured,
        isPopular,
      }
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: error.message || "Failed to create product" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const fullDescription = formData.get("fullDescription") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string);
  const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
  const image = formData.get("image") as string;
  const deliveryType = formData.get("deliveryType") as any;
  const duration = formData.get("duration") as string;
  const status = (formData.get("status") as any) || "ACTIVE";
  const isFeatured = formData.get("isFeatured") === "on";
  const isPopular = formData.get("isPopular") === "on";

  try {
    await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        shortDescription,
        fullDescription,
        category,
        price,
        comparePrice,
        image,
        deliveryType,
        duration,
        status,
        isFeatured,
        isPopular,
      }
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateOrderStatus(orderId: string, status: any, adminNote: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status, adminNote }
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/track-order");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function updateSettings(data: any) {
  try {
    // Assuming a single settings row exists
    const existing = await prisma.settings.findFirst();
    if (existing) {
      await prisma.settings.update({
        where: { id: existing.id },
        data: {
          instapayAccount: data.instapayAccount,
          instapayReceiverName: data.instapayReceiverName,
          whatsappNumber: data.whatsappNumber,
        }
      });
    } else {
      await prisma.settings.create({ data });
    }
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function getReceiptSignedUrl(filePath: string) {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
    // Generate a signed URL that expires in 60 seconds
    const { data, error } = await supabaseAdmin.storage
      .from('receipts')
      .createSignedUrl(filePath, 60);

    if (error) throw error;
    return { url: data.signedUrl };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { error: "Failed to generate access URL" };
  }
}

export async function createDiscountCode(formData: FormData) {
  const code = (formData.get("code") as string).trim().toUpperCase();
  const percentage = parseFloat(formData.get("percentage") as string);
  const maxUses = formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : null;
  const expiryDateRaw = (formData.get("expiryDate") as string) || "";
  const expiryDate = expiryDateRaw
    ? new Date(`${expiryDateRaw}T23:59:59`)
    : null;

  try {
    await prisma.discountCode.create({
      data: {
        code,
        percentage,
        maxUses,
        expiryDate,
      }
    });
    revalidatePath("/admin/discount-codes");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating discount code:", error);
    return { error: error.message || "Failed to create discount code" };
  }
}

export async function deleteDiscountCode(id: string) {
  try {
    await prisma.discountCode.delete({
      where: { id }
    });
    revalidatePath("/admin/discount-codes");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete discount code" };
  }
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  try {
    await prisma.discountCode.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/discount-codes");
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle discount code" };
  }
}
