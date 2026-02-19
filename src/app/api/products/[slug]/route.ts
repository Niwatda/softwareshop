import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      longDescription: true,
      features: true,
      price: true,
      comparePrice: true,
      image: true,
      images: true,
      youtubeUrl: true,
      version: true,
      updatedAt: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
