"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { parsePackagesJson, syncProductPackages } from "@/lib/packages";
import { ensureUncategorizedCategory } from "@/app/actions/categories";

export async function createProduct(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const fullDescription = formData.get("fullDescription") as string;
  const categoryId = ((formData.get("categoryId") as string) || "").trim() || null;
  const price = parseFloat(formData.get("price") as string);
  const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
  const image = formData.get("image") as string;
  const deliveryType = formData.get("deliveryType") as string;
  const duration = formData.get("duration") as string;
  const isFeatured = formData.get("isFeatured") === "on";
  const isPopular = formData.get("isPopular") === "on";

  if (!title || !slug) return { error: "اسم المنتج والرابط مطلوبان" };
  if (!Number.isFinite(price) || price < 0) return { error: "السعر غير صالح" };

  const parsedPackages = parsePackagesJson(formData.get("packagesJson") as string | null);
  if (parsedPackages.error) return { error: parsedPackages.error };

  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId) {
    const uncategorized = await ensureUncategorizedCategory();
    resolvedCategoryId = uncategorized.id;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title,
          slug,
          shortDescription,
          fullDescription,
          categoryId: resolvedCategoryId,
          price,
          comparePrice,
          image,
          deliveryType,
          duration,
          status: "ACTIVE",
          isFeatured,
          isPopular,
        },
      });

      await syncProductPackages(tx, product.id, parsedPackages.packages || []);
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error?.code === "P2002") return { error: "الرابط المخصص مستخدم بالفعل" };
    return { error: error.message || "Failed to create product" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const fullDescription = formData.get("fullDescription") as string;
  const categoryId = ((formData.get("categoryId") as string) || "").trim() || null;
  const price = parseFloat(formData.get("price") as string);
  const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
  const image = formData.get("image") as string;
  const deliveryType = formData.get("deliveryType") as string;
  const duration = formData.get("duration") as string;
  const status = (formData.get("status") as string) || "ACTIVE";
  const isFeatured = formData.get("isFeatured") === "on";
  const isPopular = formData.get("isPopular") === "on";

  if (!title || !slug) return { error: "اسم المنتج والرابط مطلوبان" };
  if (!Number.isFinite(price) || price < 0) return { error: "السعر غير صالح" };

  const parsedPackages = parsePackagesJson(formData.get("packagesJson") as string | null);
  if (parsedPackages.error) return { error: parsedPackages.error };

  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId) {
    const uncategorized = await ensureUncategorizedCategory();
    resolvedCategoryId = uncategorized.id;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          title,
          slug,
          shortDescription,
          fullDescription,
          categoryId: resolvedCategoryId,
          price,
          comparePrice,
          image,
          deliveryType,
          duration,
          status,
          isFeatured,
          isPopular,
        },
      });

      await syncProductPackages(tx, id, parsedPackages.packages || []);
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    if (error?.code === "P2002") return { error: "الرابط المخصص مستخدم بالفعل" };
    return { error: "Failed to update product" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateOrderStatus(orderId: string, status: string, adminNote: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "غير مصرح" };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status, adminNote }
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/track-order");
    revalidatePath("/admin/candidates");
    revalidatePath("/candidate");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function updateSettings(data: any) {
  try {
    await requireAdmin();
  } catch {
    return { success: false };
  }

  try {
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
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase");
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
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const code = (formData.get("code") as string).trim().toUpperCase();
  const percentage = parseFloat(formData.get("percentage") as string);
  const maxUses = formData.get("maxUses") ? parseInt(formData.get("maxUses") as string) : null;
  const expiryDateRaw = (formData.get("expiryDate") as string) || "";
  const expiryDate = expiryDateRaw
    ? new Date(`${expiryDateRaw}T23:59:59`)
    : null;

  if (!code) return { error: "كود الخصم مطلوب" };
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    return { error: "نسبة الخصم غير صالحة" };
  }

  try {
    await prisma.discountCode.create({
      data: {
        code,
        percentage,
        maxUses,
        expiryDate,
        type: "GENERAL",
      }
    });
    revalidatePath("/admin/discount-codes");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating discount code:", error);
    if (error?.code === "P2002") return { error: "كود الخصم مستخدم بالفعل" };
    return { error: error.message || "Failed to create discount code" };
  }
}

export async function deleteDiscountCode(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  try {
    const linked = await prisma.candidateProfile.findUnique({ where: { couponId: id } });
    if (linked) {
      return { error: "لا يمكن حذف كود مرتبط بمرشح. قم بتعطيله أو تعديل المرشح أولاً." };
    }
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
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

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
