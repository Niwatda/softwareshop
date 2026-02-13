"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const defaultTestimonials = [
  { name: "พี่ต้อม", role: "เจ้าของร้านค้าออนไลน์", content: "ใช้มา 3 เดือนแล้ว ช่วยจัดการงานได้เยอะมาก เมื่อก่อนทำเองหมดเลย ตอนนี้สบายขึ้นเป็นสิบเท่า", rating: 5 },
  { name: "เอ็ม", role: "ฟรีแลนซ์", content: "ตอนแรกลังเลอยู่ แต่ลองซื้อมาใช้แล้วคุ้มมาก ใช้ง่ายด้วย ไม่ต้องเป็นสายเทคก็ใช้ได้", rating: 5 },
  { name: "คุณบอส", role: "ผู้จัดการทีม IT", content: "ลองมาหลายโปรแกรมแล้ว ตัวนี้โอเคสุด ทั้งเรื่องความเร็วและการใช้งาน แถมราคาเบามาก", rating: 5 },
];

const defaults = {
  title: "คนใช้จริงว่ายังไง?",
  description: "รีวิวจากลูกค้าที่ซื้อไปใช้จริงๆ",
  items: defaultTestimonials,
};

interface TestimonialsProps {
  data?: Record<string, unknown>;
}

export function Testimonials({ data }: TestimonialsProps) {
  const d = { ...defaults, ...data } as typeof defaults;
  const items = (d.items || defaultTestimonials) as typeof defaultTestimonials;

  return (
    <section className="py-20 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {d.title}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {d.description}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {items.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-slate-700 bg-slate-800 p-8"
            >
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-slate-300">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="mt-6">
                <p className="font-semibold text-white">
                  {testimonial.name}
                </p>
                <p className="text-sm text-slate-400">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
