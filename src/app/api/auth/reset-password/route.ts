import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Return success even if user doesn't exist (prevent email enumeration)
      return NextResponse.json({ message: "หากอีเมลมีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตไปให้" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
