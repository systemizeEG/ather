import { cookies } from "next/headers";
import { getTranslation, parseLocale, type Locale } from "@/lib/dictionaries";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get("NEXT_LOCALE")?.value);
}

export function dateLocale(locale: Locale) {
  return locale === "ar" ? "ar-EG" : "en-GB";
}

export function formatMoneyAmount(amount: number, locale: Locale) {
  return `${amount} ${getTranslation(locale).common.currency}`;
}

export function formatTargetValue(value: number, targetType: string | undefined, locale: Locale) {
  const t = getTranslation(locale);
  if (targetType === "REVENUE") return formatMoneyAmount(value, locale);
  const unit = value === 1 ? t.admin.ordersUnitOne : t.admin.ordersUnit;
  return `${value} ${unit}`;
}
