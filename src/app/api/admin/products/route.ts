import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const products = await db.product.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = productSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const product = await db.product.create({
      data: result.data,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: unknown) {
    console.error("Product create error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "slug นี้ถูกใช้ไปแล้ว ลองเปลี่ยน slug ใหม่นะ" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "บันทึกไม่สำเร็จ: " + message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await req.json();
  const result = productSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const product = await db.product.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ product });
  } catch (err: unknown) {
    console.error("Product update error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "slug นี้ถูกใช้ไปแล้ว ลองเปลี่ยน slug ใหม่นะ" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "อัปเดตไม่สำเร็จ: " + message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // ดึงข้อมูลก่อนลบ เพื่อลบไฟล์ใน Storage ด้วย
    const product = await db.product.findUnique({ where: { id } });

    // ลบ orders ที่เกี่ยวข้องก่อน
    await db.order.deleteMany({ where: { productId: id } });

    // ลบ product
    await db.product.delete({ where: { id } });

    // ลบไฟล์ใน Supabase Storage (ถ้ามี)
    if (product?.downloadUrl) {
      try {
        const supabase = getSupabaseAdmin();
        let filesToDelete: string[] = [];

        // ตรวจสอบว่าเป็น chunked หรือไม่
        try {
          const parsed = JSON.parse(product.downloadUrl);
          if (parsed.chunks && Array.isArray(parsed.chunks)) {
            filesToDelete = parsed.chunks;
          }
        } catch {
          // ไม่ใช่ JSON = ไฟล์เดียว
          if (!product.downloadUrl.startsWith("http")) {
            filesToDelete = [product.downloadUrl];
          }
        }

        if (filesToDelete.length > 0) {
          const paths = filesToDelete.map((f) =>
            f.startsWith("programs/") ? f.replace("programs/", "") : f
          );
          await supabase.storage.from(STORAGE_BUCKETS.PROGRAMS).remove(paths);
        }
      } catch (storageErr) {
        console.error("Storage cleanup error (non-critical):", storageErr);
      }
    }

    return NextResponse.json({ message: "ลบเรียบร้อย" });
  } catch (err: unknown) {
    console.error("Delete error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "ลบไม่สำเร็จ: " + message },
      { status: 500 }
    );
  }
}
