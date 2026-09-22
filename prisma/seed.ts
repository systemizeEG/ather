import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

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

  await upsertDiscount({
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
    expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  });
  await upsertDiscount({
    code: "PAUSED15",
    percentage: 15,
    type: "GENERAL",
    isActive: false,
  });

  console.log("\nSeed complete (admin, settings, catalog, general coupons).\n");
  console.log("Admin:    admin / admin123");
  console.log("Coupons:  WELCOME10  SAVE20(exhausted)  OLD5(expired)  PAUSED15(off)");
  console.log("Packages: /store/tes1  /store/gold-ring  /store/silk-bracelet  /store/gift-set");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
