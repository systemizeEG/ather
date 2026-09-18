"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";

export type PackageField = {
  id?: string;
  key: string;
  name: string;
  description: string;
  quantity: number;
  price: string;
  compareAtPrice: string;
  isActive: boolean;
};

function newPackage(): PackageField {
  return {
    key: crypto.randomUUID(),
    name: "",
    description: "",
    quantity: 2,
    price: "",
    compareAtPrice: "",
    isActive: true,
  };
}

export function PackageEditor({
  initialPackages = [],
}: {
  initialPackages?: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    price: number;
    compareAtPrice: number | null;
    isActive: boolean;
  }>;
}) {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<PackageField[]>(
    initialPackages.map((pkg) => ({
      id: pkg.id,
      key: pkg.id,
      name: pkg.name,
      description: pkg.description || "",
      quantity: pkg.quantity,
      price: String(pkg.price),
      compareAtPrice: pkg.compareAtPrice != null ? String(pkg.compareAtPrice) : "",
      isActive: pkg.isActive,
    }))
  );

  const update = (key: string, patch: Partial<PackageField>) => {
    setPackages((current) => current.map((pkg) => (pkg.key === key ? { ...pkg, ...patch } : pkg)));
  };

  const serialized = packages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    quantity: Number(pkg.quantity),
    price: Number(pkg.price),
    compareAtPrice: pkg.compareAtPrice === "" ? null : Number(pkg.compareAtPrice),
    isActive: pkg.isActive,
  }));

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{t.admin.packagesTitle}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.admin.packagesDesc}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => setPackages((current) => [...current, newPackage()])}>
          <Plus className="w-4 h-4 ms-0 me-1.5" /> {t.admin.addPackage}
        </Button>
      </div>

      <input type="hidden" name="packagesJson" value={JSON.stringify(serialized)} />

      {packages.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4">
          {t.admin.noPackages}
        </p>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <div key={pkg.key} className="border border-border rounded-2xl p-4 space-y-4 bg-background">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{t.admin.packageN.replace("{n}", String(index + 1))}</h3>
                <button
                  type="button"
                  onClick={() => setPackages((current) => current.filter((item) => item.key !== pkg.key))}
                  className="text-red-500 hover:text-red-600 text-sm font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> {t.admin.delete}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.admin.packageName}</label>
                  <Input
                    value={pkg.name}
                    onChange={(e) => update(pkg.key, { name: e.target.value })}
                    placeholder={t.admin.packageName}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.admin.packageQty}</label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={pkg.quantity}
                    onChange={(e) => update(pkg.key, { quantity: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t.admin.packagePrice.replace("{currency}", t.common.currency)}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={pkg.price}
                    onChange={(e) => update(pkg.key, { price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.admin.packageCompare}</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={pkg.compareAtPrice}
                    onChange={(e) => update(pkg.key, { compareAtPrice: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t.admin.packageDesc}</label>
                <Input
                  value={pkg.description}
                  onChange={(e) => update(pkg.key, { description: e.target.value })}
                  placeholder={t.admin.packageDesc}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pkg.isActive}
                  onChange={(e) => update(pkg.key, { isActive: e.target.checked })}
                  className="w-5 h-5 accent-accent"
                />
                <span>{t.admin.packageActive}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
