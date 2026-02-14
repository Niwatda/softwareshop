import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const { productSlug, slipImage } = await req.json();

  if (!productSlug || !slipImage) {
    return NextResponse.json({ error: "กรุณาระบุสินค้าและอัปโหลดสลิป" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { slug: productSlug } });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  // ตรวจสอบว่าเคยซื้อสำเร็จแล้วหรือยัง
  const existingOrder = await db.order.findFirst({
    where: {
      userId: session.user.id,
      productId: product.id,
      status: "COMPLETED",
    },
  });

  if (existingOrder) {
    return NextResponse.json({ error: "คุณซื้อสินค้านี้แล้ว" }, { status: 400 });
  }

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      productId: product.id,
      amount: product.price,
      slipImage,
      status: "PENDING",
    },
  });

  return NextResponse.json({ order, message: "แจ้งชำระเงินสำเร็จ รอ admin ตรวจสอบ" });
}
