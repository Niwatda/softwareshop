"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">สมาชิกทั้งหมด</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">ดูรายชื่อสมาชิกที่สมัครเข้ามา</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">ชื่อ</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">อีเมล</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">ประเภท</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">ซื้อไปแล้ว</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">สมัครเมื่อ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-6 py-4 font-medium">{user.name || "N/A"}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{user._count.orders}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
