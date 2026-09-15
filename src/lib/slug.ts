export function slugify(input: string) {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `item-${Date.now().toString(36)}`;
}
