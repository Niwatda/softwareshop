"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

const defaultFeatures = [
  { icon: "Zap", title: "เร็วมากๆ", description: "เปิดปุ๊บ ใช้ได้ปั๊บ ไม่ต้องรอโหลดนาน ทำงานลื่นไหลไม่มีสะดุด" },
  { icon: "Shield", title: "ปลอดภัย ไร้กังวล", description: "ข้อมูลของคุณเข้ารหัสแน่นหนา ไม่มีหลุด ไม่มีรั่ว ใช้ได้สบายใจ" },
  { icon: "BarChart3", title: "ดูรายงานง่ายๆ", description: "สรุปผลให้อัตโนมัติ ไม่ต้องนั่งทำเอง เข้าใจง่ายในพริบตา" },
  { icon: "Cloud", title: "ใช้ได้ทุกที่", description: "ข้อมูลซิงค์อัตโนมัติ จะอยู่ที่ไหนก็เปิดใช้ได้ ไม่ต้องพก USB" },
  { icon: "Smartphone", title: "ใช้ได้ทุกเครื่อง", description: "จะคอม โน้ตบุ๊ค แท็บเล็ต หรือมือถือ เปิดใช้ได้หมด ไม่มีปัญหา" },
  { icon: "HeadphonesIcon", title: "มีปัญหา ถามได้เลย", description: "ทีมซัพพอร์ตพร้อมช่วยเหลือตลอด ตอบไว ไม่ทิ้งให้รอนาน" },
];

const defaults = {
  title: "ทำไมต้องโปรแกรมนี้?",
  description: "เพราะมันช่วยให้ชีวิตง่ายขึ้นจริงๆ",
  items: defaultFeatures,
};

function getIcon(name: string) {
  const Icon = (LucideIcons as Record<string, unknown>)[name] as React.ComponentType<{ className?: string }> | undefined;
  return Icon || LucideIcons.Zap;
}

interface FeaturesProps {
  data?: Record<string, unknown>;
}

export function Features({ data }: FeaturesProps) {
  const d = { ...defaults, ...data } as typeof defaults;
  const items = (d.items || defaultFeatures) as typeof defaultFeatures;

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            {d.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {d.description}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((feature, index) => {
            const IconComponent = getIcon(feature.icon);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all hover:border-violet-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-600"
              >
                <div className="inline-flex rounded-xl bg-violet-600 p-3">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
