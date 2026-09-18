"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, ArrowRight, Save, Upload } from "lucide-react";
import Link from "next/link";
import { createProduct } from "@/app/actions/admin";
import { PackageEditor } from "@/components/admin/PackageEditor";
import { useTranslation } from "@/components/TranslationProvider";
import { uploadAdminImage } from "@/lib/upload-admin-image";

type CategoryOption = {
  id: string;
  name: string;
};

export function NewProductForm({ categories }: { categories: CategoryOption[] }) {
  const { t, locale } = useTranslation();
  const BackIcon = locale === "ar" ? ArrowLeft : ArrowRight;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);

    try {
      const url = await uploadAdminImage(file);
      setFileUrl(url);
    } catch {
      alert(t.admin.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.admin.addProductTitle}</h1>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">
            {t.admin.back} <BackIcon className="w-4 h-4 ms-2" />
          </Button>
        </Link>
      </div>

      <form
        action={async (formData) => {
          setIsSubmitting(true);
          const result = await createProduct(formData);
          if (result && result.error) {
            alert(result.error);
            setIsSubmitting(false);
          }
        }}
        className="space-y-8"
      >
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <h2 className="text-xl font-bold mb-4">{t.admin.basicData}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t.admin.productName}</label>
              <Input name="title" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t.admin.productSlug}</label>
              <Input name="slug" required dir="ltr" className="text-start" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t.admin.colCategory}</label>
              <select
                name="categoryId"
                required
                className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">{t.admin.selectCategory}</option>
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
                  {t.admin.priceLabel.replace("{currency}", t.common.currency)}
                </label>
                <Input name="price" type="number" step="0.01" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t.admin.comparePrice}</label>
                <Input name="comparePrice" type="number" step="0.01" min="0" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.shortDesc}</label>
            <textarea
              name="shortDescription"
              required
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-xl font-bold mb-4">{t.admin.productImage}</h2>
            <input type="hidden" name="image" value={fileUrl} />

            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-8 text-center transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                {uploading ? (
                  <div>{t.admin.uploading}</div>
                ) : fileUrl ? (
                  <div className="text-green-500 font-bold">{t.admin.imageUploaded}</div>
                ) : (
                  <div>
                    <Upload className="mx-auto w-8 h-8 text-muted-foreground mb-3" />
                    <span className="text-muted-foreground">{t.admin.chooseImage}</span>
                  </div>
                )}
              </div>
            </label>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t.admin.deliveryType}</label>
                <select
                  name="deliveryType"
                  className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="INSTANT">{t.admin.instant}</option>
                  <option value="MANUAL">{t.admin.manual}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t.admin.subscriptionDuration}</label>
                <Input name="duration" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-xl font-bold mb-4">{t.admin.fullDesc}</h2>
            <textarea
              name="fullDescription"
              rows={8}
              className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent"
            ></textarea>
          </div>
        </div>

        <PackageEditor />

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xl font-bold">{t.admin.visibility}</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isFeatured" defaultChecked className="w-5 h-5 accent-accent" />
            <span>{t.admin.featuredHome}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isPopular" className="w-5 h-5 accent-accent" />
            <span>{t.admin.popularTag}</span>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" variant="glow" isLoading={isSubmitting} className="h-14 px-8 text-lg">
            <Save className="w-5 h-5 ms-0 me-2" /> {t.admin.saveProduct}
          </Button>
        </div>
      </form>
    </div>
  );
}
