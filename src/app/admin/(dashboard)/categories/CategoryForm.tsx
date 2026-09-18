"use client";

import { useEffect, useState } from "react";
import { createCategory, updateCategory } from "@/app/actions/categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/slug";
import { ChevronDown, Upload } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";

export function CategoryForm({
  category,
  onDone,
}: {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
  };
  onDone?: () => void;
}) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [fileUrl, setFileUrl] = useState(category?.image || "");
  const [uploading, setUploading] = useState(false);
  const [showExtra, setShowExtra] = useState(Boolean(category?.description || category?.image));

  useEffect(() => {
    if (!slugTouched) setSlug(name ? slugify(name) : "");
  }, [name, slugTouched]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setFileUrl(data.url);
    } catch {
      alert(t.admin.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true);
        const result = category
          ? await updateCategory(category.id, formData)
          : await createCategory(formData);
        setIsSubmitting(false);
        if (result.error) {
          alert(result.error);
          return;
        }
        onDone?.();
      }}
      className="space-y-5"
    >
      <input type="hidden" name="image" value={fileUrl} />
      <input type="hidden" name="isActive" value={category ? (category.isActive ? "on" : "") : "on"} />

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.admin.categoryName}</label>
        <Input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.admin.categoryNamePlaceholder}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t.admin.categorySlug}</label>
        <Input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="perfumes"
          dir="ltr"
          className="text-start"
        />
        <p className="text-xs text-muted-foreground mt-1">{t.admin.slugHint}</p>
      </div>

      <button
        type="button"
        onClick={() => setShowExtra((value) => !value)}
        className="flex items-center gap-2 text-sm font-medium text-gold-deep"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${showExtra ? "rotate-180" : ""}`} />
        {t.admin.extraOptions}
      </button>

      {showExtra && (
        <div className="space-y-4 rounded-2xl border border-gold/20 p-4 bg-background/60">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.admin.description}</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={category?.description || ""}
              placeholder={t.admin.optional}
              className="w-full bg-card border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <label className="block cursor-pointer">
            <div className="border border-dashed border-gold/30 hover:border-gold rounded-xl p-4 text-center">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              {uploading ? (
                t.admin.uploading
              ) : fileUrl ? (
                <span className="text-green-600 font-medium">{t.admin.imageUploaded}</span>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  {t.admin.categoryImage}
                </div>
              )}
            </div>
          </label>
        </div>
      )}

      {!showExtra && <input type="hidden" name="description" value={category?.description || ""} />}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          {category ? t.admin.save : t.admin.addCategory}
        </Button>
      </div>
    </form>
  );
}
