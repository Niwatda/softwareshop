"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, Package, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    { label: "สมาชิกทั้งหมด", value: stats.totalUsers, icon: Users, color: "indigo" },
    { label: "คำสั่งซื้อ", value: stats.totalOrders, icon: ShoppingBag, color: "green" },
    { label: "โปรแกรม", value: stats.totalProducts, icon: Package, color: "purple" },
    { label: "รายได้รวม", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "yellow" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ภาพรวมหลังบ้าน</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">ดูสถิติทั้งหมดได้ที่นี่</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl bg-${card.color}-100 p-3 dark:bg-${card.color}-900/50`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
