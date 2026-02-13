import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "ตั้งรหัสผ่านใหม่ - SoftwareShop",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ตั้งรหัสผ่านใหม่</h2>
        <p>คุณขอรีเซ็ตรหัสผ่านใช่มั้ย? กดปุ่มข้างล่างเพื่อตั้งรหัสใหม่ได้เลย:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">
          ตั้งรหัสผ่านใหม่
        </a>
        <p style="margin-top: 16px; color: #666;">ลิงก์นี้ใช้ได้ 1 ชั่วโมงนะ รีบหน่อย!</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: { productName: string; amount: number }
) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `ซื้อสำเร็จ! - ${orderDetails.productName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ขอบคุณที่ซื้อนะ!</h2>
        <p>คุณซื้อ <strong>${orderDetails.productName}</strong> เรียบร้อยแล้ว</p>
        <p>ไปโหลดโปรแกรมได้เลยที่หน้าดาวน์โหลด:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/downloads" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">
          ไปหน้าดาวน์โหลด
        </a>
      </div>
    `,
  });
}
