"use client";

import { useState } from "react";
import { deleteCategory, toggleCategory } from "@/app/actions/categories";
import { CategoryForm } from "./CategoryForm";
import { Button } from "@/components/ui/Button";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPanel } from "@/components/admin/AdminPageHeader";
import { Pencil, Plus, Search, Trash2, Power } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  _count: { products: number };
};

export function CategoryManager({
  categories,
  query,
}: {
  categories: CategoryRow[];
  query?: string;
}) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const editing = editingId ? categories.find((item) => item.id === editingId) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query || ""}
              placeholder={t.admin.searchCategory}
              className="w-full h-11 bg-card border border-gold/25 rounded-full ps-10 pe-4 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <Button type="submit" variant="outline">
            {t.admin.search}
          </Button>
        </form>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 ms-0 me-1.5" /> {t.admin.addCategory}
        </Button>
      </div>

      <AdminPanel>
        {categories.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted-foreground">{t.admin.emptyCategories}</div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <div key={category.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate">{category.name}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        category.isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {category.isActive ? t.admin.visibleInStore : t.admin.hidden}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.admin.productCount.replace("{count}", String(category._count.products))}
                    <span className="mx-2 text-border">·</span>
                    <span dir="ltr">/{category.slug}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(category.id)}>
                    <Pencil className="w-4 h-4 ms-0 me-1" /> {t.admin.edit}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleCategory(category.id, !category.isActive)}
                  >
                    <Power className="w-4 h-4 ms-0 me-1" />
                    {category.isActive ? t.admin.hide : t.admin.show}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={async () => {
                      if (!confirm(t.admin.confirmDeleteCategory)) return;
                      const result = await deleteCategory(category.id);
                      if (result.error) alert(result.error);
                    }}
                  >
                    <Trash2 className="w-4 h-4 ms-0 me-1" /> {t.admin.delete}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminModal open={creating} title={t.admin.addCategory} onClose={() => setCreating(false)}>
        <CategoryForm onDone={() => setCreating(false)} />
      </AdminModal>

      <AdminModal open={Boolean(editing)} title={t.admin.editCategory} onClose={() => setEditingId(null)}>
        {editing && (
          <CategoryForm key={editing.id} category={editing} onDone={() => setEditingId(null)} />
        )}
      </AdminModal>
    </div>
  );
}
