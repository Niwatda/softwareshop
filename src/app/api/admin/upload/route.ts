import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string | null; // "image" or "program"

  if (!file) {
    return NextResponse.json({ error: "ไม่มีไฟล์นะ" }, { status: 400 });
  }

  const isImage = type === "image" || ALLOWED_IMAGE_TYPES.includes(file.type);

  // จำกัดขนาดรูป 5MB, ไฟล์โปรแกรม 500MB
  const maxSize = isImage ? 5 * 1024 * 1024 : 500 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: isImage ? "รูปใหญ่เกินไป (สูงสุด 5MB)" : "ไฟล์ใหญ่เกินไป (สูงสุด 500MB)" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${safeName}`;

  // เลือก bucket ตามประเภทไฟล์
  const bucket = isImage ? STORAGE_BUCKETS.IMAGES : STORAGE_BUCKETS.PROGRAMS;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
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

  // สร้าง public URL สำหรับรูปภาพ
  if (isImage) {
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      fileName: urlData.publicUrl,
      isImage,
      message: "อัปโหลดเรียบร้อย!",
    });
  }

  // สำหรับไฟล์โปรแกรม คืนชื่อไฟล์ (จะดาวน์โหลดผ่าน signed URL)
  return NextResponse.json({
    fileName,
    isImage,
    message: "อัปโหลดเรียบร้อย!",
  });
}
