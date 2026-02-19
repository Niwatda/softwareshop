import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวนะ"),
  email: z.string().email("อีเมลไม่ถูกต้องนะ ลองเช็คอีกที"),
  password: z
    .string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัว")
    .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
});

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้องนะ"),
  password: z.string().min(1, "ใส่รหัสผ่านด้วยนะ"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้องนะ"),
});

export const productSchema = z.object({
  name: z.string().min(1, "ใส่ชื่อโปรแกรมด้วย"),
  slug: z.string().min(1, "ใส่ slug ด้วย").transform((v) =>
    v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || v
  ),
  description: z.string().min(1, "ใส่คำอธิบายด้วยนะ"),
  longDescription: z.string().nullable().optional(),
  price: z.number().min(0, "ราคาต้องมากกว่า 0"),
  comparePrice: z.number().nullable().optional(),
  features: z.array(z.string()).optional(),
  image: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  youtubeUrl: z.string().nullable().optional(),
  downloadUrl: z.string().optional().transform((v) => v || null),
  version: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
