"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Download, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalOrders: number;
  totalDownloads: number;
  totalSpent: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalDownloads: 0, totalSpent: 0 });

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    { label: "ซื้อไปแล้ว", value: `${stats.totalOrders} รายการ`, icon: ShoppingBag, bg: "bg-indigo-100 dark:bg-indigo-900/50", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "โหลดได้", value: `${stats.totalDownloads} รายการ`, icon: Download, bg: "bg-green-100 dark:bg-green-900/50", text: "text-green-600 dark:text-green-400" },
    { label: "จ่ายไปทั้งหมด", value: formatPrice(stats.totalSpent), icon: CreditCard, bg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          สวัสดี {session?.user?.name || "เพื่อน"}!
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          นี่คือหน้าหลักของคุณ ดูข้อมูลต่างๆ ได้ที่นี่เลย
        </p>
      </motion.div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl p-3 ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.text}`} />
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
    </div>
  );
}
