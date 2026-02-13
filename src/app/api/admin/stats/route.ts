import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [totalUsers, totalOrders, totalProducts, revenueResult] = await Promise.all([
    db.user.count(),
    db.order.count({ where: { status: "COMPLETED" } }),
    db.product.count(),
    db.order.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue: revenueResult._sum.amount || 0,
  });
}
