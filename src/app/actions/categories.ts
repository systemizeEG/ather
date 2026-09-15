"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { slugify } from "@/lib/slug";
import { UNCATEGORIZED_NAME, UNCATEGORIZED_SLUG } from "@/lib/constants";

async function uniqueCategorySlug(base: string, excludeId?: string) {
  let slug = slugify(base);
  let suffix = 2;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${slugify(base)}-${suffix}`;
    suffix += 1;
  }
}

export async function ensureUncategorizedCategory() {
  return prisma.category.upsert({
    where: { slug: UNCATEGORIZED_SLUG },
    update: {},
    create: {
      name: UNCATEGORIZED_NAME,
      slug: UNCATEGORIZED_SLUG,
      description: "منتجات لم يتم تصنيفها بعد",
      isActive: true,
    },
  });
}

export async function createCategory(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = ((formData.get("description") as string) || "").trim() || null;
  const image = ((formData.get("image") as string) || "").trim() || null;
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
  const requestedSlug = ((formData.get("slug") as string) || "").trim();

  if (!name) return { error: "اسم القسم مطلوب" };

  try {
    const slug = await uniqueCategorySlug(requestedSlug || name);
    await prisma.category.create({
      data: { name, slug, description, image, isActive },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/store");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return { error: "اسم القسم أو الرابط مستخدم بالفعل" };
    }
    console.error("Error creating category:", error);
    return { error: "فشل إنشاء القسم" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = ((formData.get("description") as string) || "").trim() || null;
  const image = ((formData.get("image") as string) || "").trim() || null;
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
  const requestedSlug = ((formData.get("slug") as string) || "").trim();

  if (!name) return { error: "اسم القسم مطلوب" };

  try {
    const slug = await uniqueCategorySlug(requestedSlug || name, id);
    await prisma.category.update({
      where: { id },
      data: { name, slug, description, image, isActive },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/store");
    revalidatePath("/");
    revalidatePath(`/category/${slug}`);
    return { success: true };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return { error: "اسم القسم أو الرابط مستخدم بالفعل" };
    }
    console.error("Error updating category:", error);
    return { error: "فشل تحديث القسم" };
  }
}

export async function toggleCategory(id: string, isActive: boolean) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  try {
    await prisma.category.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/categories");
    revalidatePath("/store");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "فشل تحديث حالة القسم" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { error: "غير مصرح" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) return { error: "القسم غير موجود" };

    if (category.slug === UNCATEGORIZED_SLUG) {
      return { error: "لا يمكن حذف قسم المنتجات غير المصنفة" };
    }

    if (category._count.products > 0) {
      return {
        error: `لا يمكن حذف القسم لأنه يحتوي على ${category._count.products} منتج. قم بنقل المنتجات أو تعطيل القسم.`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/store");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "فشل حذف القسم" };
  }
}
