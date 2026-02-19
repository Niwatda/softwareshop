import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const page = await db.page.findUnique({
    where: { slug, isPublished: true },
  });

  if (!page) {
    return NextResponse.json({ error: "ไม่พบหน้านี้" }, { status: 404 });
  }

  return NextResponse.json({ page });
}
