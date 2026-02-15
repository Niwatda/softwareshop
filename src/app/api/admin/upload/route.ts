import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST - อัพโหลดไฟล์เล็ก (รูปภาพ < 5MB) ผ่าน server
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string | null;

  if (!file) {
    return NextResponse.json({ error: "ไม่มีไฟล์นะ" }, { status: 400 });
  }

  const isImage = type === "image" || ALLOWED_IMAGE_TYPES.includes(file.type);

  // จำกัดขนาดรูป 5MB (ไฟล์โปรแกรมใช้ signed URL แทน)
  if (isImage && file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "รูปใหญ่เกินไป (สูงสุด 5MB)" }, { status: 400 });
  }

  if (!isImage) {
    return NextResponse.json(
      { error: "ไฟล์โปรแกรมให้ใช้ signed upload แทน" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${safeName}`;

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.IMAGES)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return NextResponse.json(
      { error: "อัปโหลดไม่สำเร็จ ลองใหม่อีกที" },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.IMAGES)
    .getPublicUrl(fileName);

  return NextResponse.json({
    fileName: urlData.publicUrl,
    isImage: true,
    message: "อัปโหลดเรียบร้อย!",
  });
}
