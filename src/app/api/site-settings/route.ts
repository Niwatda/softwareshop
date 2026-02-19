import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public API - ส่ง settings สำหรับ navbar/footer (ไม่ต้อง login)
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ["navbar", "footer", "bank"] } },
    });

    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({});
  }
}
