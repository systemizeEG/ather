import type { Locale } from "@/lib/dictionaries";

const CATEGORY_EN: Record<string, string> = {
  jewelry: "Jewelry",
  necklaces: "Necklaces",
  bracelets: "Bracelets",
  bags: "Bags",
  uncategorized: "Uncategorized",
  archive: "Archive",
  test: "Test",
};

const PRODUCT_EN: Record<string, { title: string; short: string; full: string }> = {
  tes1: {
    title: "prod1",
    short: "test1 for prod 1",
    full: "A test product to check packages and the product page.",
  },
  "gift-set": {
    title: "Ather gift set",
    short: "A ring and bracelet in one box.",
    full: "A ready-to-give set with a blank card for a handwritten note.",
  },
  "gold-ring": {
    title: "Ather gold ring",
    short: "A slim ring with a quiet gold finish.",
    full: "A daily ring with a skin-kind finish and fine detail. Made for gifting or everyday wear.",
  },
  "pearl-necklace": {
    title: "Quiet pearl necklace",
    short: "Small pearls on a fine chain.",
    full: "A light necklace for day and evening. A length that suits most looks.",
  },
  "silk-bracelet": {
    title: "Gold silk bracelet",
    short: "A soft silk-thread bracelet with a light gleam.",
    full: "A light daily piece, easy to wear with a watch or ring.",
  },
  "evening-bag": {
    title: "Small evening bag",
    short: "A luminous clutch for the essentials.",
    full: "Made for evenings and celebrations. Removable shoulder chain.",
  },
  "uncategorized-charm": {
    title: "Ather charm",
    short: "A piece without a category, for classification tests.",
    full: "A product without a visible category. It still appears in the main vault.",
  },
};

const PHRASE_EN: Record<string, string> = {
  مجوهرات: "Jewelry",
  سلاسل: "Necklaces",
  أساور: "Bracelets",
  حقائب: "Bags",
  هدايا: "Gifts",
  ساعات: "Watches",
  "بدون قسم": "Uncategorized",
  أرشيف: "Archive",
  "خواتم وقطع ذهبية مختارة": "Selected rings and gold pieces",
  "سلاسل ولؤلؤ يترك أثراً": "Chains and pearls that leave a mark",
  "أساور حرير ومعدن": "Silk and metal bracelets",
  "حقائب سهرة صغيرة": "Small evening bags",
  "منتجات لم يتم تصنيفها بعد": "Products not categorized yet",
  "قطعة واحدة": "Single piece",
  "الخيار العادي": "Standard option",
  "طقمين للإهداء": "Two gift sets",
  "قطعتان بسعر أوفر": "Two pieces at a better price",
  "باقة قطعتين": "Two-piece bundle",
  "باقة ثلاث قطع": "Three-piece bundle",
  "أفضل قيمة للتجربة": "Best value to try",
  "زوج خواتم": "Pair of rings",
  "خاتمان متطابقان": "Two matching rings",
  "طقم ثلاثة": "Set of three",
  "ثلاثة خواتم للطبقة": "Three rings to stack",
  "سلسلة + أقراط": "Necklace + earrings",
  "طقم متناسق": "A matching set",
  "باقة صديقتين": "Bundle for two friends",
  "باقة ثلاث صديقات": "Bundle for three friends",
  "علبة هدية": "Gift box",
  "بطاقة إهداء": "Gift card",
  "ضمان كامل": "Full warranty",
  "تغليف فاخر": "Luxury wrapping",
  "تغليف هدية": "Gift wrapping",
  "ضمان سنة": "One-year warranty",
  "مقاس قابل للتعديل": "Adjustable size",
  "لؤلؤ صناعي فاخر": "Fine faux pearls",
  "قفل آمن": "Secure clasp",
  "علبة مخمل": "Velvet box",
  "مقاس واحد مرن": "One flexible size",
  "ألوان محايدة": "Neutral colors",
  "سلسلة ذهبية": "Gold chain",
  "بطانة مخمل": "Velvet lining",
  "جيب داخلي": "Inner pocket",
  "حجم صغير": "Small size",
  "طقم جاهز للإهداء مع بطاقة فارغة للكتابة.": "A ready-to-give set with a blank card for a handwritten note.",
  "طقم جاهز للإهداء مع بطاقة فارغة للكتابة": "A ready-to-give set with a blank card for a handwritten note",
  "خاتم وسوار في علبة واحدة.": "A ring and bracelet in one box.",
  "خاتم وسوار في علبة واحدة": "A ring and bracelet in one box",
  "طقم هدية أثر": "Ather gift set",
  "خاتم أثر الذهبي": "Ather gold ring",
  "خاتم نحيف بلمسة ذهبية هادئة.": "A slim ring with a quiet gold finish.",
  "خاتم يومي بخامة لطيفة على البشرة وتفاصيل دقيقة. مناسب للإهداء أو للارتداء اليومي.":
    "A daily ring with a skin-kind finish and fine detail. Made for gifting or everyday wear.",
  "سلسلة لؤلؤ هادئة": "Quiet pearl necklace",
  "لؤلؤ صغير على سلسلة رفيعة.": "Small pearls on a fine chain.",
  "سلسلة خفيفة للمناسبات النهارية والمساء. طول مناسب لمعظم الإطلالات.":
    "A light necklace for day and evening. A length that suits most looks.",
  "سوار حرير ذهبي": "Gold silk bracelet",
  "سوار ناعم بخيط حرير ولمعة خفيفة.": "A soft silk-thread bracelet with a light gleam.",
  "قطعة يومية خفيفة، سهلة التنسيق مع الساعة أو الخاتم.": "A light daily piece, easy to wear with a watch or ring.",
  "حقيبة سهرة صغيرة": "Small evening bag",
  "حقيبة يد لامعة تكفي للضروريات.": "A luminous clutch for the essentials.",
  "مناسبة للسهرات والحفلات. سلسلة كتف قابلة للإزالة.": "Made for evenings and celebrations. Removable shoulder chain.",
  "تعليقة أثر": "Ather charm",
  "قطعة بلا قسم لاختبار التصنيف.": "A piece without a category, for classification tests.",
  "منتج بدون قسم ظاهر، يظهر في الخزينة العامة.": "A product without a visible category. It still appears in the main vault.",
  "منتج تجريبي للتحقق من الباقات وصفحة المنتج.": "A test product to check packages and the product page.",
  "قسم غير ظاهر في المتجر": "A category hidden from the store",
  "قسم تجريبي موجود مسبقاً": "An existing test category",
  فوري: "Instant",
  "2-3 أيام": "2–3 days",
  "2-4 أيام": "2–4 days",
  "3-5 أيام": "3–5 days",
  "4-6 أيام": "4–6 days",
};

function translateDuration(value: string) {
  return value
    .replace(/(\d+)\s*-\s*(\d+)\s*أيام/, "$1–$2 days")
    .replace(/(\d+)\s*أيام/, "$1 days")
    .replace(/يوم(?:ين)?/, "day");
}

export function tx(locale: Locale, value?: string | null) {
  if (!value) return "";
  if (locale !== "en") return value;
  const trimmed = value.trim();
  return PHRASE_EN[trimmed] || PHRASE_EN[value] || translateDuration(trimmed);
}

export function localizeCategoryName(locale: Locale, slug?: string | null, name?: string | null) {
  if (locale !== "en") return name || "";
  if (slug && CATEGORY_EN[slug]) return CATEGORY_EN[slug];
  return tx(locale, name);
}

export function localizeFeatures(locale: Locale, features: string[]) {
  return features.map((feature) => tx(locale, feature));
}

export function localizeProductTitle(locale: Locale, slug: string, title: string) {
  if (locale !== "en") return title;
  return PRODUCT_EN[slug]?.title || tx(locale, title) || title;
}

export function localizeProductShort(locale: Locale, slug: string, short?: string | null) {
  if (locale !== "en") return short || "";
  return PRODUCT_EN[slug]?.short || tx(locale, short) || short || "";
}

export function brandWord(locale: Locale) {
  return locale === "en" ? "Ather" : "أثر";
}

export function formatMoney(amount: number, currency: string) {
  return `${amount} ${currency}`;
}

function featureText(features?: string | null) {
  if (!features) return "";
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed.join(" ") : features;
  } catch {
    return features;
  }
}

export function productMatchesSearch(
  product: {
    slug: string;
    title: string;
    shortDescription?: string | null;
    fullDescription?: string | null;
    features?: string | null;
    category?: { name?: string | null; slug?: string | null } | null;
  },
  query?: string | null
) {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;

  const localized = localizeProduct("en", product);
  const haystack = [
    product.slug,
    product.slug.replace(/-/g, " "),
    product.title,
    product.shortDescription,
    product.fullDescription,
    featureText(product.features),
    product.category?.name,
    product.category?.slug,
    localized.title,
    localized.shortDescription,
    localized.fullDescription,
    localized.category && typeof localized.category === "object" ? localized.category.name : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return needle.split(/\s+/).every((token) => haystack.includes(token));
}

export function localizeProduct<T extends { slug: string; title: string }>(locale: Locale, product: T): T {
  if (locale !== "en") return product;
  const extra = PRODUCT_EN[product.slug];
  const raw = product as T & {
    shortDescription?: string | null;
    fullDescription?: string | null;
    duration?: string | null;
    category?: { name?: string; slug?: string; isActive?: boolean } | string | null;
    packages?: Array<{ name: string; description: string | null }>;
  };
  const category =
    raw.category && typeof raw.category === "object"
      ? {
          ...raw.category,
          name: localizeCategoryName(locale, raw.category.slug, raw.category.name),
        }
      : raw.category;

  return {
    ...product,
    title: extra?.title || tx(locale, product.title),
    shortDescription: extra?.short || tx(locale, raw.shortDescription) || raw.shortDescription,
    fullDescription: extra?.full || tx(locale, raw.fullDescription) || raw.fullDescription,
    duration: tx(locale, raw.duration) || raw.duration,
    category,
    packages: raw.packages?.map((pkg) => ({
      ...pkg,
      name: tx(locale, pkg.name),
      description: tx(locale, pkg.description) || pkg.description,
    })),
  };
}
