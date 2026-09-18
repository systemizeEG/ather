import type { Metadata } from "next";
import { Cairo, El_Messiri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/dictionaries";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";

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

const ogImage = {
  url: SITE_OG_IMAGE,
  secureUrl: `${SITE_URL}${SITE_OG_IMAGE}`,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: SITE_TITLE,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "أثر",
    "Ather",
    "إكسسوارات",
    "مجوهرات",
    "حقائب",
    "متجر إلكتروني",
    "accessories",
    "jewelry",
    "Egypt",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  robots: { index: true, follow: true },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [ogImage],
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    type: "website",
    countryName: "Egypt",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [ogImage.url],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get("NEXT_LOCALE")?.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}${SITE_OG_IMAGE}`,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
    },
    areaServed: "EG",
  };

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${cairo.variable} ${elMessiri.variable} font-sans antialiased text-foreground bg-background flex flex-col min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers locale={locale}>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
