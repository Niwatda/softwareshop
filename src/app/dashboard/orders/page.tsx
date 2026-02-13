"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: { name: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
    PENDING: { label: "รอตรวจสอบ", variant: "warning" },
    COMPLETED: { label: "สำเร็จ", variant: "success" },
    REFUNDED: { label: "คืนเงิน", variant: "destructive" },
    FAILED: { label: "ล้มเหลว", variant: "destructive" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">คำสั่งซื้อของฉัน</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">ดูประวัติการซื้อทั้งหมดได้ที่นี่</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              ยังไม่ได้ซื้ออะไรเลย ไปดูโปรแกรมกันก่อน!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">โปรแกรม</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">ราคา</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">สถานะ</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">วันที่ซื้อ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-6 py-4 font-medium">{order.product.name}</td>
                      <td className="px-6 py-4">{formatPrice(order.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusMap[order.status]?.variant}>
                          {statusMap[order.status]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
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
