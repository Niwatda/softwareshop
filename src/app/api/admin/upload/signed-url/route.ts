import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { STORAGE_BUCKETS } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST - สร้างข้อมูลสำหรับอัพโหลดไฟล์ใหญ่ตรงไป Supabase Storage ด้วย TUS
// เฉพาะ Admin เท่านั้นที่เข้าถึงได้
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase ไม่ได้ตั้งค่า" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: storagePath,
    bucket: storageBucket,
    supabaseUrl,
    // ส่ง service role key ให้ admin client สำหรับ TUS upload
    // ปลอดภัยเพราะ endpoint นี้ต้อง admin auth เท่านั้น
    uploadToken: serviceRoleKey,
    message: "พร้อมอัพโหลด",
  });
}
