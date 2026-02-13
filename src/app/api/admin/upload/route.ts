import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

  // รูปเก็บใน public/uploads/images, ไฟล์โปรแกรมเก็บใน uploads/
  const subDir = isImage ? path.join(process.cwd(), "public", "uploads", "images") : path.join(process.cwd(), "uploads");
  await mkdir(subDir, { recursive: true });

  const filePath = path.join(subDir, fileName);
  await writeFile(filePath, buffer);

  // รูปคืน path ที่เข้าถึงได้จาก browser
  const publicPath = isImage ? `/uploads/images/${fileName}` : fileName;

  return NextResponse.json({
    fileName: publicPath,
    isImage,
    message: "อัปโหลดเรียบร้อย!",
  });
}
