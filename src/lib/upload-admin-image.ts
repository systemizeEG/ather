const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;
const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;

export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("INVALID_TYPE");
  }

  if (file.type === "image/gif") {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("TOO_LARGE");
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      if (file.size > MAX_UPLOAD_BYTES) throw new Error("TOO_LARGE");
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) {
      if (file.size > MAX_UPLOAD_BYTES) throw new Error("TOO_LARGE");
      return file;
    }

    const compressed = new File([blob], replaceExtension(file.name, "jpg"), {
      type: "image/jpeg",
    });
    if (compressed.size > MAX_UPLOAD_BYTES && file.size > MAX_UPLOAD_BYTES) {
      throw new Error("TOO_LARGE");
    }
    return compressed.size <= file.size ? compressed : file.size > MAX_UPLOAD_BYTES ? compressed : file;
  } catch (error) {
    if (error instanceof Error && (error.message === "TOO_LARGE" || error.message === "INVALID_TYPE")) {
      throw error;
    }
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("TOO_LARGE");
    return file;
  }
}

export async function uploadAdminImage(file: File): Promise<string> {
  const prepared = await prepareImageForUpload(file);
  const formData = new FormData();
  formData.append("file", prepared);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await res.json().catch(() => null)) as
    | { success?: boolean; url?: string; error?: string }
    | null;

  if (!res.ok || !data?.success || !data.url) {
    throw new Error(data?.error || "UPLOAD_FAILED");
  }

  return data.url;
}

function replaceExtension(name: string, ext: string) {
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}
