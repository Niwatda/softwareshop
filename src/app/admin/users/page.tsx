"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Trash2, Pencil, X, Save } from "lucide-react";

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
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  const openEditForm = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPassword("");
    setEditRole(user.role);
    setError("");
  };

  const closeEditForm = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditPassword("");
    setEditRole("USER");
    setError("");
  };

  const handleSaveUser = async () => {
    if (!editingId) return;
    if (!editName.trim()) { setError("กรุณากรอกชื่อ"); return; }
    if (!editEmail.trim()) { setError("กรุณากรอกอีเมล"); return; }

    setSaving(true);
    setError("");

    try {
      const body: Record<string, string> = {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
      };
      if (editPassword) {
        body.password = editPassword;
      }

      const res = await fetch(`/api/admin/users?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === editingId ? data.user : u)));
        closeEditForm();
      } else {
        const data = await res.json();
        setError(data.error || "แก้ไขไม่สำเร็จ");
      }
    } catch {
      setError("เกิดข้อผิดพลาด");
    }
    setSaving(false);
  };

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    if (!confirm(`ต้องการลบผู้ใช้ "${userName || userId}" หรือไม่?\nข้อมูลคำสั่งซื้อที่เกี่ยวข้องจะถูกลบด้วย`)) return;
    setDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || "ลบไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
    setDeleting(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">สมาชิกทั้งหมด</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">ดูรายชื่อสมาชิกที่สมัครเข้ามา</p>

      {/* ฟอร์มแก้ไข */}
      {editingId && (
        <Card className="mt-6 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">แก้ไขข้อมูลสมาชิก</h2>
              <button onClick={closeEditForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อ</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="ชื่อผู้ใช้"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="อีเมล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  รหัสผ่านใหม่ <span className="text-gray-400 font-normal">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="รหัสผ่านใหม่"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ประเภท</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={closeEditForm}>
                ยกเลิก
              </Button>
              <Button
                className="gap-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={saving}
                onClick={handleSaveUser}
              >
                <Save size={14} /> {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <th className="px-6 py-3 text-left font-medium text-gray-500">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-100 dark:border-gray-800 ${editingId === user.id ? "bg-indigo-50 dark:bg-indigo-950/30" : ""}`}
                    >
                      <td className="px-6 py-4 font-medium">{user.name || "N/A"}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{user._count.orders}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => openEditForm(user)}
                          >
                            <Pencil size={14} /> แก้ไข
                          </Button>
                          {user.role !== "ADMIN" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                              disabled={deleting === user.id}
                              onClick={() => handleDeleteUser(user.id, user.name)}
                            >
                              <Trash2 size={14} /> ลบ
                            </Button>
                          )}
                        </div>
                      </td>
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
