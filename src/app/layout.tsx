import type { Metadata } from "next";
import { Cairo, El_Messiri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TranslationProvider } from "@/components/TranslationProvider";
import { cookies } from "next/headers";
import { Locale } from "@/lib/dictionaries";
import { SpeedInsights } from "@vercel/speed-insights/next";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ather.store"),
  title: {
    default: "أثر | Ather — إكسسوارات تترك أثراً",
    template: "%s | أثر",
  },
  description:
    "متجر أثر لإكسسوارات فاخرة مختارة بعناية. قطع تترك انطباعاً يدوم، مع تغليف أنيق وشحن موثوق داخل مصر.",
  keywords: [
    "أثر",
    "Ather",
    "إكسسوارات",
    "مجوهرات",
    "حقائب",
    "متجر إلكتروني",
    "accessories",
    "Egypt",
  ],
  openGraph: {
    title: "أثر | Ather — إكسسوارات تترك أثراً",
    description:
      "متجر أثر لإكسسوارات فاخرة مختارة بعناية. قطع تترك انطباعاً يدوم.",
    url: "https://ather.store",
    siteName: "أثر | Ather",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "شعار أثر",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "أثر | Ather — إكسسوارات تترك أثراً",
    description: "إكسسوارات فاخرة مختارة بعناية من متجر أثر.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://ather.store",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const locale = (localeCookie?.value as Locale) || "ar";

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${cairo.variable} ${elMessiri.variable} font-sans antialiased text-foreground bg-background flex flex-col min-h-screen`}
      >
        <TranslationProvider initialLocale={locale}>
          <Providers>{children}</Providers>
        </TranslationProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
