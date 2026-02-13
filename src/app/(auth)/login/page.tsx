"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกทีนะ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            SoftwareShop
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            เข้าสู่ระบบ
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            กลับมาแล้ว! เข้ามาเลย
          </p>
        </div>

        <div className="mt-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="อีเมล"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={fieldErrors.email}
            />
            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={fieldErrors.password}
            />

            <div className="text-right">
              <Link href="/reset-password" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              เข้าสู่ระบบ
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline dark:text-indigo-400">
              สมัครเลย
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
