import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

  // สร้าง signed URL จาก Supabase Storage (หมดอายุ 60 วินาที)
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.PROGRAMS)
    .createSignedUrl(product.downloadUrl, 60);

  if (error || !data?.signedUrl) {
    console.error("Supabase signed URL error:", error);
    return NextResponse.json(
      { error: "หาไฟล์ไม่เจอ ติดต่อแอดมินนะ" },
      { status: 404 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
