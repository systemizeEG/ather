import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { packages: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    return notFound();
  }

  return <EditProductForm product={product} categories={categories} />;
}
