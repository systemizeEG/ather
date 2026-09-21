import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function indexablePage(path: string): Pick<Metadata, "alternates" | "openGraph"> {
  const url = absoluteUrl(path);
  return {
    alternates: { canonical: url },
    openGraph: { url },
  };
}

export function noIndexPage(path?: string): Metadata {
  const url = path ? absoluteUrl(path) : undefined;
  return {
    robots: { index: false, follow: false },
    ...(url
      ? {
          alternates: { canonical: url },
          openGraph: { url },
        }
      : {}),
  };
}
