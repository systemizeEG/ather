"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import { updateProduct } from "@/app/actions/admin";
import { PackageEditor } from "@/components/admin/PackageEditor";

export default function EditProductForm({
  product,
  categories,
}: {
  product: any;
  categories: Array<{ id: string; name: string }>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState(product.image || "");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFileUrl(data.url);
      }
    } catch {
      alert("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">تعديل المنتج</h1>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">
            العودة <ArrowLeft className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <form
        action={async (formData) => {
          const result = await updateProductWithId(formData);
          if (result && result.error) {
            alert(`خطأ: ${result.error}`);
            setIsSubmitting(false);
          }
        }}
        className="space-y-8"
        onSubmit={() => setIsSubmitting(true)}
      >
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <h2 className="text-xl font-bold mb-4">البيانات الأساسية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                اسم المنتج
              </label>
              <Input
                name="title"
                defaultValue={product.title}
                required
                placeholder="مثال: اشتراك فليكس"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                الرابط المخصص (Slug)
              </label>
              <Input
                name="slug"
                defaultValue={product.slug}
                required
                placeholder="مثال: netflix-1-month"
                dir="ltr"
                className="text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">القسم</label>
              <select
                name="categoryId"
                required
                defaultValue={product.categoryId || ""}
                className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">اختر القسم</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  السعر (ج.م)
                </label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.price}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  السعر قبل الخصم
                </label>
                <Input
                  name="comparePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.comparePrice || ""}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              وصف قصير
            </label>
            <textarea
              name="shortDescription"
              required
              rows={3}
              defaultValue={product.shortDescription || ""}
              className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-xl font-bold mb-4">صورة المنتج</h2>
            <input type="hidden" name="image" value={fileUrl} />

            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-8 text-center transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {uploading ? (
                  <div>جاري الرفع...</div>
                ) : fileUrl ? (
                  <div className="text-green-500 font-bold">
                    تم رفع الصورة بنجاح ✓
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-8 h-8 text-muted-foreground mb-3" />
                    <span className="text-muted-foreground">اختر صورة للمنتج</span>
                  </div>
                )}
              </div>
            </label>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  مدة التسليم
                </label>
                <select
                  name="deliveryType"
                  defaultValue={product.deliveryType}
                  className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="INSTANT">فوري</option>
                  <option value="MANUAL">يدوي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  مدة الاشتراك (اختياري)
                </label>
                <Input
                  name="duration"
                  defaultValue={product.duration || ""}
                  placeholder="مثال: شهر واحد"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-xl font-bold mb-4">وصف تفصيلي</h2>
            <textarea
              name="fullDescription"
              rows={8}
              defaultValue={product.fullDescription || ""}
              className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
            ></textarea>
          </div>
        </div>

        <PackageEditor initialPackages={product.packages || []} />

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <h2 className="text-xl font-bold mb-4">الحالة والظهور</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              حالة المنتج
            </label>
            <select
              name="status"
              defaultValue={product.status || "ACTIVE"}
              className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="ACTIVE">مفعل</option>
              <option value="DRAFT">غير مفعل</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={!!product.isFeatured}
              className="w-5 h-5 accent-accent"
            />
            <span>عرض في المنتجات المميزة على الصفحة الرئيسية</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isPopular"
              defaultChecked={!!product.isPopular}
              className="w-5 h-5 accent-accent"
            />
            <span>وسم الأكثر طلباً</span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            variant="glow"
            isLoading={isSubmitting}
            className="h-14 px-8 text-lg"
          >
            <Save className="w-5 h-5 ml-2" /> حفظ التعديلات
          </Button>
        </div>
      </form>
    </div>
  );
}
