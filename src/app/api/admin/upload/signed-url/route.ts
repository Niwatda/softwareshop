import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST - สร้าง signed URL สำหรับอัพโหลดไฟล์ใหญ่ตรงไป Supabase Storage
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { fileName, contentType, bucket } = body;

  if (!fileName) {
    return NextResponse.json({ error: "ต้องระบุชื่อไฟล์" }, { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${timestamp}-${safeName}`;

  // เลือก bucket
  const storageBucket = bucket === "images" ? STORAGE_BUCKETS.IMAGES : STORAGE_BUCKETS.PROGRAMS;

  const supabase = getSupabaseAdmin();

  // สร้าง signed URL สำหรับ upload (หมดอายุ 10 นาที)
  const { data, error } = await supabase.storage
    .from(storageBucket)
    .createSignedUploadUrl(storagePath);

  if (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json(
      { error: "สร้าง upload URL ไม่สำเร็จ" },
      { status: 500 }
    );
  }

  // สร้าง public URL สำหรับรูปภาพ
  let publicUrl = null;
  if (storageBucket === STORAGE_BUCKETS.IMAGES) {
    const { data: urlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(storagePath);
    publicUrl = urlData.publicUrl;
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: storagePath,
    publicUrl,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    message: "พร้อมอัพโหลด",
  });
}
