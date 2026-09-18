"use client";

import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/components/TranslationProvider";
import { EGYPT_GOVERNORATES } from "@/lib/egypt";
import type { DeliveryDetails } from "@/lib/delivery";

const fieldClass =
  "w-full h-12 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-gold";

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </label>
  );
}

export function CodDeliveryForm({
  value,
  onChange,
}: {
  value: DeliveryDetails;
  onChange: (next: DeliveryDetails) => void;
}) {
  const { t, locale } = useTranslation();

  const set = <K extends keyof DeliveryDetails>(key: K, nextValue: DeliveryDetails[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="mb-8 text-start">
      <h3 className="text-lg font-bold mb-1">{t.checkout.deliveryTitle}</h3>
      <p className="text-sm text-muted-foreground mb-5">{t.checkout.codDesc}</p>

      <div className="space-y-4">
        <div>
          <FieldLabel>{t.checkout.countryRegion}</FieldLabel>
          <div className={`${fieldClass} flex items-center text-foreground bg-muted/40`}>
            {t.checkout.egypt}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel required>{t.checkout.firstName}</FieldLabel>
            <Input
              value={value.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <FieldLabel required>{t.checkout.lastName}</FieldLabel>
            <Input
              value={value.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              required
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <FieldLabel required>{t.checkout.address}</FieldLabel>
          <Input
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <FieldLabel>{t.checkout.apartment}</FieldLabel>
          <Input
            value={value.apartment}
            onChange={(e) => set("apartment", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FieldLabel required>{t.checkout.city}</FieldLabel>
            <Input
              value={value.city}
              onChange={(e) => set("city", e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <FieldLabel required>{t.checkout.governorate}</FieldLabel>
            <select
              value={value.governorate}
              onChange={(e) => set("governorate", e.target.value)}
              required
              className={fieldClass}
            >
              <option value="">{t.checkout.selectGovernorate}</option>
              {EGYPT_GOVERNORATES.map((item) => (
                <option key={item.id} value={item.id}>
                  {locale === "ar" ? item.ar : item.en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>{t.checkout.postalCode}</FieldLabel>
            <Input
              value={value.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              className={fieldClass}
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <FieldLabel required>{t.checkout.deliveryPhone}</FieldLabel>
          <Input
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
            dir="ltr"
            className={`${fieldClass} text-start`}
          />
        </div>

        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={value.marketingOptIn}
            onChange={(e) => set("marketingOptIn", e.target.checked)}
            className="w-4 h-4 accent-gold"
          />
          <span>{t.checkout.marketingOptIn}</span>
        </label>
      </div>
    </div>
  );
}
