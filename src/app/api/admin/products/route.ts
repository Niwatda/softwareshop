import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";

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

  await db.product.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}
