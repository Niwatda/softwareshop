import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          version: true,
          downloadUrl: true,
        },
      },
    },
  });

  const products = orders.map((order) => order.product);

  return NextResponse.json({ products });
}
