import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const pages = await db.page.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, slug, blocks, isPublished } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "ต้องใส่ชื่อหน้าและ slug" }, { status: 400 });
  }

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    const page = await db.page.create({
      data: { title, slug: safeSlug, blocks: blocks || [], isPublished: isPublished ?? false },
    });
    return NextResponse.json({ page }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "slug นี้ถูกใช้แล้ว" }, { status: 400 });
    }
    return NextResponse.json({ error: "สร้างไม่สำเร็จ: " + msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const { title, slug, blocks, isPublished, sortOrder } = body;

  const safeSlug = slug
    ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : undefined;

  try {
    const page = await db.page.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(safeSlug && { slug: safeSlug }),
        ...(blocks !== undefined && { blocks }),
        ...(isPublished !== undefined && { isPublished }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    return NextResponse.json({ page });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ: " + msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.page.delete({ where: { id } });
  return NextResponse.json({ message: "ลบเรียบร้อย" });
}
