import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@softwareshop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@softwareshop.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create products
  const products = [
    {
      name: "Starter Plan",
      slug: "starter",
      description: "แพ็คเกจเริ่มต้น เหมาะสำหรับผู้ใช้งานคนเดียว พร้อมฟีเจอร์พื้นฐานครบครัน",
      price: 149000,
      comparePrice: 199000,
      features: [
        "ใช้งานได้ 1 เครื่อง",
        "อัปเดตฟรี 6 เดือน",
        "Community Support",
        "Basic Features",
      ],
      version: "2.0.0",
      isActive: true,
    },
    {
      name: "Professional Plan",
      slug: "professional",
      description: "แพ็คเกจยอดนิยม สำหรับทีมและธุรกิจ พร้อมฟีเจอร์ครบทุกอย่าง",
      price: 349000,
      comparePrice: 499000,
      features: [
        "ใช้งานได้ 5 เครื่อง",
        "อัปเดตฟรีตลอดชีพ",
        "Priority Support",
        "All Features",
        "API Access",
        "Custom Reports",
      ],
      version: "2.0.0",
      isActive: true,
    },
    {
      name: "Enterprise Plan",
      slug: "enterprise",
      description: "แพ็คเกจสำหรับองค์กรขนาดใหญ่ พร้อม Dedicated Support และ SLA",
      price: 999000,
      features: [
        "ใช้งานได้ไม่จำกัด",
        "อัปเดตฟรีตลอดชีพ",
        "Dedicated Support",
        "All Features",
        "API Access",
        "Custom Reports",
        "On-premise Deploy",
        "SLA 99.9%",
      ],
      version: "2.0.0",
      isActive: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
