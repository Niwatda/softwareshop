"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const defaults = {
  title: "พร้อมลองแล้วยัง?",
  description: "ซื้อวันนี้ ถ้าไม่ชอบคืนเงินได้ภายใน 30 วัน ไม่มีเงื่อนไข!",
  button: "ดูราคาเลย",
};

interface CTAProps {
  data?: Record<string, unknown>;
}

export function CTA({ data }: CTAProps) {
  const d = { ...defaults, ...data } as typeof defaults;

  return (
    <section className="py-20 bg-slate-100 dark:bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-violet-700 px-8 py-16 text-center sm:px-16"
        >
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            {d.title}
          </h2>
          <p className="relative mt-4 text-lg text-violet-200">
            {d.description}
          </p>
          <div className="relative mt-8">
            <Link href="/#pricing">
              <Button size="lg" className="bg-white text-violet-700 hover:bg-slate-100 gap-2">
                {d.button} <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
