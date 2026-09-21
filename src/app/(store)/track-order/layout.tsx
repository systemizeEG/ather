import type { Metadata } from "next";
import { noIndexPage } from "@/lib/seo";

export const metadata: Metadata = noIndexPage("/track-order");

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
