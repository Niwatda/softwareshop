import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API - ไม่ต้อง login ก็ดูได้
export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        features: true,
        price: true,
        comparePrice: true,
        image: true,
        images: true,
        youtubeUrl: true,
        version: true,
      },
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ products: [] });
  }
}
