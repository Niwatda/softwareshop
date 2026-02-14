import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, currentPassword, newPassword } = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};

  // อัปเดตชื่อ
  if (name !== undefined) {
    if (!name.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อ" }, { status: 400 });
    }
    updateData.name = name.trim();
  }

  // อัปเดตอีเมล
  if (email !== undefined) {
    if (!email.trim()) {
      return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
    }
    // ตรวจสอบอีเมลซ้ำ
    const existing = await db.user.findFirst({
      where: { email: email.trim(), NOT: { id: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }
    updateData.email = email.trim();
  }

  // อัปเดตรหัสผ่าน
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "กรุณากรอกรหัสผ่านเดิม" }, { status: 400 });
    }

    // ดึง password ปัจจุบันจาก DB
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: "ไม่สามารถเปลี่ยนรหัสผ่านได้" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "รหัสผ่านเดิมไม่ถูกต้อง" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัว" }, { status: 400 });
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "ไม่มีข้อมูลที่ต้องอัปเดต" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  return NextResponse.json({ message: "อัปเดตเรียบร้อยแล้ว" });
}
