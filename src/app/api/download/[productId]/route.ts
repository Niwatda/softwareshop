import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface ChunkedDownload {
  chunks: string[];
  originalName: string;
}

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

  const supabase = getSupabaseAdmin();

  // ตรวจสอบว่าเป็น chunked download หรือไม่
  let chunkedData: ChunkedDownload | null = null;
  try {
    const parsed = JSON.parse(product.downloadUrl);
    if (parsed.chunks && Array.isArray(parsed.chunks)) {
      chunkedData = parsed as ChunkedDownload;
    }
  } catch {
    // ไม่ใช่ JSON = ไฟล์เดียว
  }

  if (chunkedData) {
    // === Chunked download: สร้าง signed URLs สำหรับแต่ละ chunk ===
    const signedUrls: string[] = [];
    for (const chunk of chunkedData.chunks) {
      const chunkPath = chunk.startsWith("programs/")
        ? chunk.replace("programs/", "")
        : chunk;
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROGRAMS)
        .createSignedUrl(chunkPath, 600); // 10 นาที

      if (error || !data?.signedUrl) {
        console.error("Chunk signed URL error:", error, "path:", chunkPath);
        return NextResponse.json(
          { error: "หาไฟล์บางส่วนไม่เจอ ติดต่อแอดมินนะ" },
          { status: 404 }
        );
      }
      signedUrls.push(data.signedUrl);
    }

    // ส่ง URLs กลับให้ client รวมไฟล์เอง
    return NextResponse.json({
      type: "chunked",
      chunks: signedUrls,
      originalName: chunkedData.originalName || `${product.name}.zip`,
    });
  }

  // === Single file download ===
  const filePath = product.downloadUrl.startsWith("programs/")
    ? product.downloadUrl.replace("programs/", "")
    : product.downloadUrl;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.PROGRAMS)
    .createSignedUrl(filePath, 300);

  if (error || !data?.signedUrl) {
    console.error("Supabase signed URL error:", error);
    return NextResponse.json(
      { error: "หาไฟล์ไม่เจอ ติดต่อแอดมินนะ" },
      { status: 404 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
