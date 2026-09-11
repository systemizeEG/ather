import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get("type") || "product"; // Default to product

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // --- CASE 1: Private Receipts -> Supabase Storage ---
    if (uploadType === "receipt") {
      const { supabaseAdmin } = await import("@/lib/supabase");
      const bytes = await file.arrayBuffer();
      
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      
      const { data: uploadData, error } = await supabaseAdmin.storage
        .from('receipts')
        .upload(fileName, bytes, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error("Supabase Upload Error:", error);
        return NextResponse.json({ error: "Private upload failed" }, { status: 500 });
      }

      // Return the path (not a public URL)
      return NextResponse.json({ success: true, url: uploadData.path });
    }

    // --- CASE 2: Product Images -> ImgBB ---
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      // Fallback to local upload for development if no API key
      const { writeFile } = await import("fs/promises");
      const path = await import("path");
      const { v4: uuidv4 } = await import("uuid");

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueFileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${uniqueFileName}` });
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({ success: true, url: result.data.url });
    } else {
      console.error("ImgBB Upload Error:", result);
      return NextResponse.json({ error: "Cloud upload failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
