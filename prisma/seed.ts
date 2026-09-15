import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function upsertCategory(data: {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}) {
  return prisma.category.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    },
    create: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    },
  });
}

async function upsertProduct(data: {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string | null;
  price: number;
  comparePrice?: number | null;
  image: string;
  stock: number;
  duration?: string | null;
  deliveryType?: string | null;
  features: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  status?: string;
  keepExistingImage?: boolean;
}) {
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  const image = existing?.image && data.keepExistingImage ? existing.image : data.image;
  const payload = {
    title: data.title,
    shortDescription: data.shortDescription,
    fullDescription: data.fullDescription,
    categoryId: data.categoryId,
    price: data.price,
    comparePrice: data.comparePrice ?? null,
    image,
    stock: data.stock,
    duration: data.duration ?? null,
    deliveryType: data.deliveryType ?? "INSTANT",
    features: JSON.stringify(data.features),
    isFeatured: data.isFeatured ?? true,
    isPopular: data.isPopular ?? false,
    status: data.status ?? "ACTIVE",
  };

  if (existing) {
    return prisma.product.update({ where: { slug: data.slug }, data: payload });
  }

  return prisma.product.create({ data: { slug: data.slug, ...payload } });
}

async function syncPackages(
  productId: string,
  packages: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
    compareAtPrice?: number | null;
    isActive?: boolean;
  }>
) {
  for (const pkg of packages) {
    const existing = await prisma.productPackage.findFirst({
      where: { productId, name: pkg.name },
    });
    const payload = {
      description: pkg.description ?? null,
      quantity: pkg.quantity,
      price: pkg.price,
      compareAtPrice: pkg.compareAtPrice ?? null,
      isActive: pkg.isActive ?? true,
    };
    if (existing) {
      await prisma.productPackage.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.productPackage.create({
        data: { productId, name: pkg.name, ...payload },
      });
    }
  }
}

async function upsertUser(data: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      phone: data.phone ?? null,
      role: data.role,
      passwordHash,
    },
    create: {
      email: data.email,
      name: data.name,
      phone: data.phone ?? null,
      role: data.role,
      passwordHash,
    },
  });
}

async function upsertDiscount(data: {
  code: string;
  percentage: number;
  type: string;
  isActive?: boolean;
  usedCount?: number;
  maxUses?: number | null;
  expiryDate?: Date | null;
}) {
  return prisma.discountCode.upsert({
    where: { code: data.code },
    update: {
      percentage: data.percentage,
      type: data.type,
      isActive: data.isActive ?? true,
      usedCount: data.usedCount ?? 0,
      maxUses: data.maxUses ?? null,
      expiryDate: data.expiryDate ?? null,
    },
    create: {
      code: data.code,
      percentage: data.percentage,
      type: data.type,
      isActive: data.isActive ?? true,
      usedCount: data.usedCount ?? 0,
      maxUses: data.maxUses ?? null,
      expiryDate: data.expiryDate ?? null,
    },
  });
}

async function upsertCandidate(data: {
  userId: string;
  couponId: string;
  targetType: string;
  targetValue: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
}) {
  const existing = await prisma.candidateProfile.findUnique({
    where: { userId: data.userId },
  });
  const payload = {
    couponId: data.couponId,
    targetType: data.targetType,
    targetValue: data.targetValue,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: data.isActive,
  };
  if (existing) {
    return prisma.candidateProfile.update({ where: { userId: data.userId }, data: payload });
  }
  return prisma.candidateProfile.create({ data: { userId: data.userId, ...payload } });
}

async function upsertOrder(data: {
  orderId: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  subtotal: number;
  total: number;
  discountCode?: string | null;
  discountAmount?: number;
  paymentMethod?: string;
  paymentScreenshot?: string | null;
  status: string;
  adminNote?: string | null;
  userId?: string | null;
  createdAt: Date;
  items: Array<{
    productId: string;
    packageId?: string | null;
    titleSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    packageNameSnapshot?: string | null;
    packageQuantitySnapshot?: number | null;
  }>;
}) {
  const existing = await prisma.order.findUnique({ where: { orderId: data.orderId } });
  if (existing) return existing;

  return prisma.order.create({
    data: {
      orderId: data.orderId,
      customerName: data.customerName,
      phone: data.phone,
      whatsapp: data.whatsapp ?? data.phone,
      email: data.email ?? null,
      notes: data.notes ?? null,
      subtotal: data.subtotal,
      total: data.total,
      discountCode: data.discountCode ?? null,
      discountAmount: data.discountAmount ?? 0,
      paymentMethod: data.paymentMethod ?? "INSTAPAY",
      paymentScreenshot: data.paymentScreenshot ?? "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
      status: data.status,
      adminNote: data.adminNote ?? null,
      userId: data.userId ?? null,
      createdAt: data.createdAt,
      items: { create: data.items },
    },
  });
}

async function main() {
  const existingAdmin = await prisma.adminUser.findUnique({ where: { username: "admin" } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        passwordHash: await bcrypt.hash("admin123", 10),
        role: "SUPERADMIN",
      },
    });
    console.log("Created admin user: admin / admin123");
  } else {
    console.log("Admin user already exists.");
  }

  const existingSettings = await prisma.settings.findFirst();
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        instapayReceiverName: "أثر ستور",
        instapayAccount: "ather@instapay",
        whatsappNumber: "+201000000000",
        storeName: "أثر | Ather",
        supportText: "للاستفسار تواصل معنا على واتساب في أي وقت.",
      },
    });
  }

  const jewelry = await upsertCategory({
    name: "مجوهرات",
    slug: "jewelry",
    description: "خواتم وقطع ذهبية مختارة",
  });
  const necklaces = await upsertCategory({
    name: "سلاسل",
    slug: "necklaces",
    description: "سلاسل ولؤلؤ يترك أثراً",
  });
  const bracelets = await upsertCategory({
    name: "أساور",
    slug: "bracelets",
    description: "أساور حرير ومعدن",
  });
  const bags = await upsertCategory({
    name: "حقائب",
    slug: "bags",
    description: "حقائب سهرة صغيرة",
  });
  const uncategorized = await upsertCategory({
    name: "بدون قسم",
    slug: "uncategorized",
    description: "منتجات لم يتم تصنيفها بعد",
  });
  await upsertCategory({
    name: "أرشيف",
    slug: "archive",
    description: "قسم غير ظاهر في المتجر",
    isActive: false,
  });
  await upsertCategory({
    name: "test",
    slug: "test",
    description: "قسم تجريبي موجود مسبقاً",
  });

  const tes1 = await upsertProduct({
    slug: "tes1",
    title: "prod1",
    shortDescription: "test1 for prod 1",
    fullDescription: "منتج تجريبي للتحقق من الباقات وصفحة المنتج.",
    categoryId: (await prisma.category.findUnique({ where: { slug: "test" } }))?.id ?? jewelry.id,
    price: 100,
    comparePrice: 150,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    stock: 20,
    duration: "5",
    deliveryType: "INSTANT",
    features: ["ضمان كامل", "تغليف فاخر"],
    isFeatured: true,
    isPopular: true,
    keepExistingImage: true,
  });
  await syncPackages(tes1.id, [
    {
      name: "باقة قطعتين",
      description: "قطعتان بسعر أوفر",
      quantity: 2,
      price: 180,
      compareAtPrice: 300,
    },
    {
      name: "باقة ثلاث قطع",
      description: "أفضل قيمة للتجربة",
      quantity: 3,
      price: 250,
      compareAtPrice: 450,
    },
  ]);

  const goldRing = await upsertProduct({
    slug: "gold-ring",
    title: "خاتم أثر الذهبي",
    shortDescription: "خاتم نحيف بلمسة ذهبية هادئة.",
    fullDescription:
      "خاتم يومي بخامة لطيفة على البشرة وتفاصيل دقيقة. مناسب للإهداء أو للارتداء اليومي.",
    categoryId: jewelry.id,
    price: 450,
    comparePrice: 620,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
    stock: 18,
    duration: "2-4 أيام",
    deliveryType: "INSTANT",
    features: ["تغليف هدية", "ضمان سنة", "مقاس قابل للتعديل"],
    isFeatured: true,
    isPopular: true,
  });
  await syncPackages(goldRing.id, [
    { name: "زوج خواتم", description: "خاتمان متطابقان", quantity: 2, price: 820, compareAtPrice: 900 },
    { name: "طقم ثلاثة", description: "ثلاثة خواتم للطبقة", quantity: 3, price: 1180, compareAtPrice: 1350 },
  ]);

  const pearlNecklace = await upsertProduct({
    slug: "pearl-necklace",
    title: "سلسلة لؤلؤ هادئة",
    shortDescription: "لؤلؤ صغير على سلسلة رفيعة.",
    fullDescription: "سلسلة خفيفة للمناسبات النهارية والمساء. طول مناسب لمعظم الإطلالات.",
    categoryId: necklaces.id,
    price: 780,
    comparePrice: 950,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
    stock: 12,
    duration: "3-5 أيام",
    deliveryType: "MANUAL",
    features: ["لؤلؤ صناعي فاخر", "قفل آمن", "علبة مخمل"],
    isFeatured: true,
  });
  await syncPackages(pearlNecklace.id, [
    { name: "سلسلة + أقراط", description: "طقم متناسق", quantity: 2, price: 1350, compareAtPrice: 1560 },
  ]);

  const silkBracelet = await upsertProduct({
    slug: "silk-bracelet",
    title: "سوار حرير ذهبي",
    shortDescription: "سوار ناعم بخيط حرير ولمعة خفيفة.",
    fullDescription: "قطعة يومية خفيفة، سهلة التنسيق مع الساعة أو الخاتم.",
    categoryId: bracelets.id,
    price: 220,
    comparePrice: 280,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
    stock: 40,
    duration: "فوري",
    deliveryType: "INSTANT",
    features: ["مقاس واحد مرن", "ألوان محايدة"],
    isFeatured: true,
  });
  await syncPackages(silkBracelet.id, [
    { name: "باقة صديقتين", quantity: 2, price: 390, compareAtPrice: 440 },
    { name: "باقة ثلاث صديقات", quantity: 3, price: 540, compareAtPrice: 660 },
  ]);

  const eveningBag = await upsertProduct({
    slug: "evening-bag",
    title: "حقيبة سهرة صغيرة",
    shortDescription: "حقيبة يد لامعة تكفي للضروريات.",
    fullDescription: "مناسبة للسهرات والحفلات. سلسلة كتف قابلة للإزالة.",
    categoryId: bags.id,
    price: 980,
    comparePrice: 1250,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a94180c?auto=format&fit=crop&w=900&q=80",
    stock: 8,
    duration: "4-6 أيام",
    deliveryType: "MANUAL",
    features: ["سلسلة ذهبية", "بطانة مخمل", "جيب داخلي"],
    isFeatured: true,
    isPopular: true,
  });

  const giftSet = await upsertProduct({
    slug: "gift-set",
    title: "طقم هدية أثر",
    shortDescription: "خاتم وسوار في علبة واحدة.",
    fullDescription: "طقم جاهز للإهداء مع بطاقة فارغة للكتابة.",
    categoryId: jewelry.id,
    price: 890,
    comparePrice: 1100,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    stock: 15,
    duration: "2-3 أيام",
    deliveryType: "INSTANT",
    features: ["علبة هدية", "بطاقة إهداء", "ضمان كامل"],
    isFeatured: true,
    isPopular: true,
  });
  await syncPackages(giftSet.id, [
    { name: "طقمين للإهداء", quantity: 2, price: 1650, compareAtPrice: 1780 },
  ]);

  await upsertProduct({
    slug: "uncategorized-charm",
    title: "تعليقة أثر",
    shortDescription: "قطعة بلا قسم لاختبار التصنيف.",
    fullDescription: "منتج بدون قسم ظاهر، يظهر في الخزينة العامة.",
    categoryId: uncategorized.id,
    price: 90,
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80",
    stock: 30,
    deliveryType: "INSTANT",
    features: ["حجم صغير"],
    isFeatured: false,
  });

  await upsertProduct({
    slug: "draft-ring",
    title: "خاتم غير منشور",
    shortDescription: "مسودة لا تظهر في المتجر.",
    fullDescription: "لاختبار حالة DRAFT في لوحة التحكم.",
    categoryId: jewelry.id,
    price: 300,
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80",
    stock: 0,
    deliveryType: "MANUAL",
    features: [],
    isFeatured: false,
    status: "DRAFT",
  });

  const customer = await upsertUser({
    email: "sara@ather.test",
    name: "سارة علي",
    password: "customer123",
    phone: "01011112222",
    role: "CUSTOMER",
  });
  const nora = await upsertUser({
    email: "nora@ather.test",
    name: "نورا حسن",
    password: "candidate123",
    phone: "01022223333",
    role: "CANDIDATE",
  });
  const karim = await upsertUser({
    email: "karim@ather.test",
    name: "كريم فؤاد",
    password: "candidate123",
    phone: "01033334444",
    role: "CANDIDATE",
  });
  const lina = await upsertUser({
    email: "lina@ather.test",
    name: "لينا عادل",
    password: "candidate123",
    phone: "01044445555",
    role: "CANDIDATE",
  });

  const welcome = await upsertDiscount({
    code: "WELCOME10",
    percentage: 10,
    type: "GENERAL",
    usedCount: 1,
  });
  await upsertDiscount({
    code: "SAVE20",
    percentage: 20,
    type: "GENERAL",
    usedCount: 2,
    maxUses: 2,
  });
  await upsertDiscount({
    code: "OLD5",
    percentage: 5,
    type: "GENERAL",
    expiryDate: daysFromNow(-10),
  });
  await upsertDiscount({
    code: "PAUSED15",
    percentage: 15,
    type: "GENERAL",
    isActive: false,
  });
  const noraCoupon = await upsertDiscount({
    code: "NORA15",
    percentage: 15,
    type: "CANDIDATE",
    usedCount: 5,
  });
  const karimCoupon = await upsertDiscount({
    code: "KARIM10",
    percentage: 10,
    type: "CANDIDATE",
    usedCount: 2,
  });
  const linaCoupon = await upsertDiscount({
    code: "LINA20",
    percentage: 20,
    type: "CANDIDATE",
    isActive: true,
    usedCount: 1,
  });

  await upsertCandidate({
    userId: nora.id,
    couponId: noraCoupon.id,
    targetType: "ORDERS",
    targetValue: 5,
    startDate: daysFromNow(-30),
    endDate: daysFromNow(60),
    isActive: true,
  });
  await upsertCandidate({
    userId: karim.id,
    couponId: karimCoupon.id,
    targetType: "REVENUE",
    targetValue: 5000,
    startDate: daysFromNow(-15),
    endDate: daysFromNow(90),
    isActive: true,
  });
  await upsertCandidate({
    userId: lina.id,
    couponId: linaCoupon.id,
    targetType: "ORDERS",
    targetValue: 10,
    startDate: daysFromNow(-90),
    endDate: daysFromNow(-5),
    isActive: false,
  });

  const tes1Pack2 = await prisma.productPackage.findFirst({
    where: { productId: tes1.id, name: "باقة قطعتين" },
  });
  const ringPack = await prisma.productPackage.findFirst({
    where: { productId: goldRing.id, name: "زوج خواتم" },
  });
  const braceletPack = await prisma.productPackage.findFirst({
    where: { productId: silkBracelet.id, name: "باقة ثلاث صديقات" },
  });

  await upsertOrder({
    orderId: "ATH-1001",
    customerName: "سارة علي",
    phone: "01011112222",
    email: customer.email,
    notes: "طلب مكتمل بباقة",
    subtotal: 180,
    total: 162,
    discountCode: welcome.code,
    discountAmount: 18,
    status: "COMPLETED",
    userId: customer.id,
    createdAt: daysFromNow(-12),
    items: [
      {
        productId: tes1.id,
        packageId: tes1Pack2?.id,
        titleSnapshot: tes1.title,
        priceSnapshot: 180,
        quantity: 1,
        packageNameSnapshot: tes1Pack2?.name,
        packageQuantitySnapshot: tes1Pack2?.quantity,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-1002",
    customerName: "سارة علي",
    phone: "01011112222",
    email: customer.email,
    subtotal: 450,
    total: 450,
    status: "PENDING_REVIEW",
    userId: customer.id,
    createdAt: daysFromNow(-1),
    items: [
      {
        productId: goldRing.id,
        titleSnapshot: goldRing.title,
        priceSnapshot: 450,
        quantity: 1,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-1003",
    customerName: "منى سمير",
    phone: "01155556666",
    email: "mona@example.com",
    subtotal: 780,
    total: 780,
    status: "PROCESSING",
    createdAt: daysFromNow(-3),
    items: [
      {
        productId: pearlNecklace.id,
        titleSnapshot: pearlNecklace.title,
        priceSnapshot: 780,
        quantity: 1,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-1004",
    customerName: "حسام نبيل",
    phone: "01277778888",
    subtotal: 980,
    total: 980,
    status: "CANCELLED",
    adminNote: "رفض الدفع بعد المراجعة",
    createdAt: daysFromNow(-8),
    items: [
      {
        productId: eveningBag.id,
        titleSnapshot: eveningBag.title,
        priceSnapshot: 980,
        quantity: 1,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-2001",
    customerName: "هدى محمود",
    phone: "01012121212",
    subtotal: 820,
    total: 697,
    discountCode: "NORA15",
    discountAmount: 123,
    status: "COMPLETED",
    createdAt: daysFromNow(-20),
    items: [
      {
        productId: goldRing.id,
        packageId: ringPack?.id,
        titleSnapshot: goldRing.title,
        priceSnapshot: 820,
        quantity: 1,
        packageNameSnapshot: ringPack?.name,
        packageQuantitySnapshot: ringPack?.quantity,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-2002",
    customerName: "ياسمين فريد",
    phone: "01013131313",
    subtotal: 220,
    total: 187,
    discountCode: "NORA15",
    discountAmount: 33,
    status: "COMPLETED",
    createdAt: daysFromNow(-10),
    items: [
      {
        productId: silkBracelet.id,
        titleSnapshot: silkBracelet.title,
        priceSnapshot: 220,
        quantity: 1,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-2003",
    customerName: "أمل يوسف",
    phone: "01014141414",
    subtotal: 890,
    total: 756.5,
    discountCode: "NORA15",
    discountAmount: 133.5,
    status: "COMPLETED",
    createdAt: daysFromNow(-4),
    items: [
      {
        productId: giftSet.id,
        titleSnapshot: giftSet.title,
        priceSnapshot: 890,
        quantity: 1,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-2004",
    customerName: "دينا كمال",
    phone: "01015151515",
    subtotal: 540,
    total: 459,
    discountCode: "NORA15",
    discountAmount: 81,
    status: "PENDING_REVIEW",
    createdAt: daysFromNow(0),
    items: [
      {
        productId: silkBracelet.id,
        packageId: braceletPack?.id,
        titleSnapshot: silkBracelet.title,
        priceSnapshot: 540,
        quantity: 1,
        packageNameSnapshot: braceletPack?.name,
        packageQuantitySnapshot: braceletPack?.quantity,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-2005",
    customerName: "سلمى رامي",
    phone: "01016161616",
    subtotal: 100,
    total: 85,
    discountCode: "NORA15",
    discountAmount: 15,
    status: "CANCELLED",
    createdAt: daysFromNow(-2),
    items: [
      {
        productId: tes1.id,
        titleSnapshot: tes1.title,
        priceSnapshot: 100,
        quantity: 1,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-3001",
    customerName: "عمر شريف",
    phone: "01017171717",
    subtotal: 1650,
    total: 1485,
    discountCode: "KARIM10",
    discountAmount: 165,
    status: "COMPLETED",
    createdAt: daysFromNow(-7),
    items: [
      {
        productId: giftSet.id,
        titleSnapshot: giftSet.title,
        priceSnapshot: 1650,
        quantity: 1,
        packageNameSnapshot: "طقمين للإهداء",
        packageQuantitySnapshot: 2,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-3002",
    customerName: "نادر هاني",
    phone: "01018181818",
    subtotal: 980,
    total: 882,
    discountCode: "KARIM10",
    discountAmount: 98,
    status: "COMPLETED",
    createdAt: daysFromNow(-2),
    items: [
      {
        productId: eveningBag.id,
        titleSnapshot: eveningBag.title,
        priceSnapshot: 980,
        quantity: 1,
      },
    ],
  });

  await upsertOrder({
    orderId: "ATH-4001",
    customerName: "ميادة صبحي",
    phone: "01019191919",
    subtotal: 780,
    total: 624,
    discountCode: "LINA20",
    discountAmount: 156,
    status: "COMPLETED",
    createdAt: daysFromNow(-40),
    items: [
      {
        productId: pearlNecklace.id,
        titleSnapshot: pearlNecklace.title,
        priceSnapshot: 780,
        quantity: 1,
      },
    ],
  });

  console.log("\nTest data is ready.\n");
  console.log("Admin:     admin / admin123");
  console.log("Customer:  sara@ather.test / customer123");
  console.log("Candidate: nora@ather.test / candidate123   coupon NORA15  (3/5 completed orders)");
  console.log("Candidate: karim@ather.test / candidate123  coupon KARIM10 (revenue target)");
  console.log("Inactive:  lina@ather.test / candidate123   coupon LINA20");
  console.log("Coupons:   WELCOME10  SAVE20(exhausted)  OLD5(expired)  PAUSED15(off)");
  console.log("Track:     ATH-1001 completed · ATH-1002 pending · ATH-1003 processing · ATH-1004 cancelled");
  console.log("Packages:  /store/tes1  /store/gold-ring  /store/silk-bracelet  /store/gift-set");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
