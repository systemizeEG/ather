export const dictionaries = {
  ar: {
    navbar: {
      home: "الرئيسية",
      store: "المتجر",
      trackOrder: "تتبع الطلب",
      faq: "الأسئلة الشائعة",
      myOrders: "طلباتي",
      logout: "خروج",
      login: "دخول",
      loginSignup: "تسجيل الدخول / إنشاء حساب",
      english: "English",
      arabic: "العربية",
      search: "بحث",
      searchPlaceholder: "ابحث عن إكسسوار...",
    },
    home: {
      heroBadge: "خزينة مختارة من الكنوز",
      heroTitle1: "افتح",
      heroTitleHighlight: "الخزينة",
      heroTitle2: "واختر أثرك",
      heroDescription:
        "كنوز من المجوهرات والحقائب والإكسسوارات — تُحفظ كما تُحفظ النفائس، وتُختار لتترك أثراً يدوم.",
      browseProducts: "استكشف الكنوز",
      howItWorks: "كيف تُفتح الخزينة؟",
      stats: {
        delivery: "شحن",
        deliveryLabel: "آمن داخل مصر",
        guarantee: "كنز",
        guaranteeLabel: "قطعة أصيلة",
        support: "24/7",
        supportLabel: "حراسة الخزينة",
      },
      whyChooseUs: "لماذا خزينة أثر؟",
      whyChooseUsDesc:
        "كل قطعة تُعامل ككنز: تُختار ببطء، تُغلّف كهدية ملكية، وتصل إليك بعناية الخزينة.",
      features: {
        f1Title: "نفائس أصيلة",
        f1Desc:
          "قطع منتقاة كما تُنتقى الكنوز — خامات ظاهرة، حضور واضح، بعيداً عن العشوائية.",
        f2Title: "صندوق فاخر",
        f2Desc:
          "طلبك يُغلق في تغليف يليق بالهدية أو الخزينة الخاصة، من الرف حتى بابك.",
        f3Title: "حراسة قريبة",
        f3Desc:
          "فريق الخزينة معك لاختيار القطعة، متابعة الشحن، أو أي استفسار — بهدوء واحتراف.",
      },
      featuredProducts: "كنوز أثر",
      featuredProductsDesc: "أحدث النفائس والقطع الأكثر طلباً هذا الموسم.",
      viewAll: "عرض الكل",
      noImage: "لا يوجد صورة",
      popular: "الأكثر طلباً",
      currency: "ج.م",
      details: "التفاصيل",
      comingSoon: "المجموعة قيد التجهيز — قريباً",
      viewAllProducts: "عرض كل المجموعة",
      faqTitle: "لديك سؤال؟",
      faqDesc:
        "من الدفع إلى الشحن والاستبدال — تجد الإجابات في صفحة الأسئلة الشائعة.",
      browseFaq: "الأسئلة الشائعة",
    },
    common: {
      currency: "ج.م",
      loading: "جاري التحميل...",
    },
  },
  en: {
    navbar: {
      home: "Home",
      store: "Store",
      trackOrder: "Track Order",
      faq: "FAQ",
      myOrders: "My Orders",
      logout: "Logout",
      login: "Login",
      loginSignup: "Login / Sign up",
      english: "English",
      arabic: "العربية",
      search: "Search",
      searchPlaceholder: "Search accessories...",
    },
    home: {
      heroBadge: "A curated vault of treasures",
      heroTitle1: "Open the",
      heroTitleHighlight: "vault",
      heroTitle2: "and leave a trace",
      heroDescription:
        "Jewelry, bags, and refined accessories kept like treasures — chosen slowly, packed like a gift, made to leave a mark.",
      browseProducts: "Explore the treasures",
      howItWorks: "How the vault works",
      stats: {
        delivery: "Shipping",
        deliveryLabel: "Secure across Egypt",
        guarantee: "Treasure",
        guaranteeLabel: "Authentic piece",
        support: "24/7",
        supportLabel: "Vault keepers",
      },
      whyChooseUs: "Why the Ather vault?",
      whyChooseUsDesc:
        "Every piece is treated as treasure: chosen slowly, wrapped like a royal gift, and guarded until it reaches you.",
      features: {
        f1Title: "Authentic jewels",
        f1Desc:
          "Pieces selected the way treasures are selected — visible materials, clear presence, never at random.",
        f2Title: "A gilded box",
        f2Desc:
          "Your order is closed in packaging worthy of a gift or a private vault, from the shelf to your door.",
        f3Title: "Close guardianship",
        f3Desc:
          "The vault team is with you for the piece, the shipment, or any question — calmly and professionally.",
      },
      featuredProducts: "Ather treasures",
      featuredProductsDesc: "This season’s newest jewels and most-requested pieces.",
      viewAll: "View all",
      noImage: "No image",
      popular: "Popular",
      currency: "EGP",
      details: "Details",
      comingSoon: "The collection is being prepared — coming soon",
      viewAllProducts: "View the full collection",
      faqTitle: "Have a question?",
      faqDesc: "From payment to shipping and exchanges — answers live in our FAQ.",
      browseFaq: "Read the FAQ",
    },
    common: {
      currency: "EGP",
      loading: "Loading...",
    },
  },
};

export type Locale = keyof typeof dictionaries;

export function getTranslation(locale: string) {
  return dictionaries[locale as Locale] || dictionaries.ar;
}
