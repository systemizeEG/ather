import { cookies } from "next/headers";
import { parseLocale, type Locale } from "@/lib/dictionaries";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get("NEXT_LOCALE")?.value);
}
