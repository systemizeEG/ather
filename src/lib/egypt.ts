export const EGYPT_COUNTRY = "Egypt";

export const EGYPT_GOVERNORATES = [
  { id: "cairo", ar: "القاهرة", en: "Cairo" },
  { id: "giza", ar: "الجيزة", en: "Giza" },
] as const;

export function isAllowedGovernorate(id: string) {
  return EGYPT_GOVERNORATES.some((item) => item.id === id);
}

export function governorateLabel(id: string, locale: "ar" | "en") {
  const match = EGYPT_GOVERNORATES.find((item) => item.id === id);
  if (!match) return id;
  return locale === "ar" ? match.ar : match.en;
}
