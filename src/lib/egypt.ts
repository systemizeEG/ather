export const EGYPT_COUNTRY = "Egypt";

export const EGYPT_GOVERNORATES = [
  { id: "cairo", ar: "القاهرة", en: "Cairo" },
  { id: "giza", ar: "الجيزة", en: "Giza" },
  { id: "alexandria", ar: "الإسكندرية", en: "Alexandria" },
  { id: "qalyubia", ar: "القليوبية", en: "Qalyubia" },
  { id: "port-said", ar: "بورسعيد", en: "Port Said" },
  { id: "suez", ar: "السويس", en: "Suez" },
  { id: "dakahlia", ar: "الدقهلية", en: "Dakahlia" },
  { id: "sharqia", ar: "الشرقية", en: "Sharqia" },
  { id: "gharbia", ar: "الغربية", en: "Gharbia" },
  { id: "monufia", ar: "المنوفية", en: "Monufia" },
  { id: "beheira", ar: "البحيرة", en: "Beheira" },
  { id: "kafr-el-sheikh", ar: "كفر الشيخ", en: "Kafr El Sheikh" },
  { id: "damietta", ar: "دمياط", en: "Damietta" },
  { id: "ismailia", ar: "الإسماعيلية", en: "Ismailia" },
  { id: "fayoum", ar: "الفيوم", en: "Fayoum" },
  { id: "beni-suef", ar: "بني سويف", en: "Beni Suef" },
  { id: "minya", ar: "المنيا", en: "Minya" },
  { id: "asyut", ar: "أسيوط", en: "Asyut" },
  { id: "sohag", ar: "سوهاج", en: "Sohag" },
  { id: "qena", ar: "قنا", en: "Qena" },
  { id: "luxor", ar: "الأقصر", en: "Luxor" },
  { id: "aswan", ar: "أسوان", en: "Aswan" },
  { id: "red-sea", ar: "البحر الأحمر", en: "Red Sea" },
  { id: "new-valley", ar: "الوادي الجديد", en: "New Valley" },
  { id: "matrouh", ar: "مطروح", en: "Matrouh" },
  { id: "north-sinai", ar: "شمال سيناء", en: "North Sinai" },
  { id: "south-sinai", ar: "جنوب سيناء", en: "South Sinai" },
] as const;

export function governorateLabel(id: string, locale: "ar" | "en") {
  const match = EGYPT_GOVERNORATES.find((item) => item.id === id);
  if (!match) return id;
  return locale === "ar" ? match.ar : match.en;
}
