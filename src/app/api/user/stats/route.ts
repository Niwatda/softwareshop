import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [totalOrders, totalDownloads, revenueResult] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.order.count({ where: { userId, status: "COMPLETED" } }),
    db.order.aggregate({
      _sum: { amount: true },
      where: { userId, status: "COMPLETED" },
    }),
  ]);

  return NextResponse.json({
    totalOrders,
    totalDownloads,
    totalSpent: revenueResult._sum.amount || 0,
  });
}
