import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "เข้าสู่ระบบก่อนนะ" }, { status: 401 });
  }

  // เช็คว่าซื้อแล้วหรือยัง
  const order = await db.order.findFirst({
    where: {
      userId: session.user.id,
      productId: params.productId,
      status: "COMPLETED",
    },
    include: { product: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "ต้องซื้อก่อนถึงจะโหลดได้นะ" },
      { status: 403 }
    );
  }

  const product = order.product;

  if (!product.downloadUrl) {
    return NextResponse.json(
      { error: "ยังไม่มีไฟล์ให้โหลด รอแป๊บนะ" },
      { status: 404 }
    );
  }

  // ถ้าเป็น URL ภายนอก ให้ redirect ไป
  if (product.downloadUrl.startsWith("http")) {
    return NextResponse.redirect(product.downloadUrl);
  }

  // ถ้าเป็นไฟล์ในเครื่อง อ่านจากโฟลเดอร์ uploads
  try {
    const filePath = path.join(process.cwd(), "uploads", product.downloadUrl);
    const fileBuffer = await readFile(filePath);
    const fileName = path.basename(product.downloadUrl);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "หาไฟล์ไม่เจอ ติดต่อแอดมินนะ" },
      { status: 404 }
    );
  }
}
