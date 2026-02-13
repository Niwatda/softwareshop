"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "เกิดข้อผิดพลาด");
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
        <div className="flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft size={16} /> กลับหน้าเข้าสู่ระบบ
          </Link>
          <Link href="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            SoftwareShop
          </Link>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          ลืมรหัสผ่าน?
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ใส่อีเมลเดี๋ยวเราส่งลิงก์ไปให้ตั้งรหัสใหม่
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            ส่งลิงก์ไปที่อีเมลแล้ว! ไปเช็คอีเมลได้เลยนะ
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            <Input
              label="อีเมล"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full" isLoading={loading}>
              ส่งลิงก์รีเซ็ต
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
