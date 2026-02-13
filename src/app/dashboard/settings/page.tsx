"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setMessage("บันทึกเรียบร้อยแล้ว!");
      } else {
        setMessage("เกิดข้อผิดพลาด ลองใหม่อีกทีนะ");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาด ลองใหม่อีกทีนะ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ตั้งค่าบัญชี</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">แก้ไขข้อมูลของคุณได้ที่นี่</p>

      <Card className="mt-6 max-w-lg">
        <CardHeader>
          <CardTitle>ข้อมูลของฉัน</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {message}
            </div>
          )}
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="ชื่อเรียก"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="อีเมล"
              value={session?.user?.email || ""}
              disabled
            />
            <Button type="submit" isLoading={loading}>
              บันทึก
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
