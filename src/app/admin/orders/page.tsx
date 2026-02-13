"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, X } from "lucide-react";

interface Order {
  id: string;
  amount: number;
  status: string;
  slipImage: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null };
  product: { name: string };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewSlip, setViewSlip] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
    PENDING: { label: "รอตรวจสอบ", variant: "warning" },
    COMPLETED: { label: "สำเร็จ", variant: "success" },
    REFUNDED: { label: "คืนเงิน", variant: "destructive" },
    FAILED: { label: "ปฏิเสธ", variant: "destructive" },
  };

  const handleUpdateStatus = async (orderId: string, status: "COMPLETED" | "FAILED") => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      } else {
        alert("เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
    setUpdating(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">คำสั่งซื้อทั้งหมด</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">ดูรายการซื้อจากลูกค้าทั้งหมด</p>

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
                    <th className="px-6 py-3 text-left font-medium text-gray-500">ลูกค้า</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">โปรแกรม</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">ราคา</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">สลิป</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">สถานะ</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">วันที่</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.user.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{order.product.name}</td>
                      <td className="px-6 py-4">{formatPrice(order.amount)}</td>
                      <td className="px-6 py-4">
                        {order.slipImage ? (
                          <button onClick={() => setViewSlip(order.slipImage)}>
                            <img src={order.slipImage} alt="สลิป" className="h-12 w-12 rounded border border-gray-200 object-cover transition-transform hover:scale-110 dark:border-gray-700" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusMap[order.status]?.variant}>
                          {statusMap[order.status]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        {order.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              disabled={updating === order.id}
                              onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                            >
                              <CheckCircle size={14} /> อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              disabled={updating === order.id}
                              onClick={() => handleUpdateStatus(order.id, "FAILED")}
                            >
                              <XCircle size={14} /> ปฏิเสธ
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal ดูสลิปขนาดเต็ม */}
      {viewSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewSlip(null)}>
          <div className="relative max-h-[90vh] max-w-lg" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewSlip(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 shadow-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <X size={18} />
            </button>
            <img src={viewSlip} alt="สลิป" className="max-h-[85vh] rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
