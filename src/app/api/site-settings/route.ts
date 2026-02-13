import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const settings = await db.siteSetting.findMany();

  const result: Record<string, unknown> = {};
  for (const setting of settings) {
    result[setting.key] = setting.value;
  }

  return NextResponse.json(result);
}
