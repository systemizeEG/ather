import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, isAdminRole } from "@/lib/auth-guards";

const PRODUCT_BUCKET = "product-images";
const RECEIPT_BUCKET = "receipts";
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_BYTES = 10 * 1024 * 1024;

function safeFileName(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9.-]/g, "_");
  return cleaned.slice(-80) || "image.jpg";
}

export async function POST(request: NextRequest) {
  try {
    const uploadType = new URL(request.url).searchParams.get("type") || "product";

    if (uploadType !== "receipt") {
      const admin = await getAdminUser();
      if (!admin || !isAdminRole(admin.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const data = await request.formData();
    const file = data.get("file") as File | null;

    if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const contentType = file.type || "image/jpeg";
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const { supabaseAdmin } = await import("@/lib/supabase");
    const bytes = await file.arrayBuffer();
    const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;

    if (uploadType === "receipt") {
      const { data: uploadData, error } = await supabaseAdmin.storage
        .from(RECEIPT_BUCKET)
        .upload(fileName, bytes, {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error("Supabase Upload Error:", error);
        return NextResponse.json({ error: "Private upload failed" }, { status: 500 });
      }

      return NextResponse.json({ success: true, url: uploadData.path });
    }

    const { data: uploadData, error } = await supabaseAdmin.storage
      .from(PRODUCT_BUCKET)
      .upload(fileName, bytes, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase product upload error:", error);
      return NextResponse.json({ error: "Cloud upload failed" }, { status: 500 });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(PRODUCT_BUCKET)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ success: true, url: publicUrl.publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
