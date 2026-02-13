"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultFaqs = [
  { question: "ใช้กับ Windows / Mac / Linux ได้มั้ย?", answer: "ได้หมดเลย! รองรับ Windows 10/11, macOS 12 ขึ้นไป และ Linux (Ubuntu 20.04+) ใช้ได้ทุกระบบ" },
  { question: "ลองใช้ก่อนซื้อได้มั้ย?", answer: "ได้ครับ! มีให้ทดลองใช้ฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต ลองใช้เต็มที่เลย" },
  { question: "ซื้อแล้วไม่ชอบ ขอเงินคืนได้มั้ย?", answer: "ได้แน่นอน! เรามีนโยบายคืนเงินภายใน 30 วัน ถ้าไม่ถูกใจ ขอคืนเงินได้เต็มจำนวนเลย" },
  { question: "อัปเดตบ่อยมั้ย?", answer: "บ่อยครับ! ออกอัปเดตทุก 2 สัปดาห์ แก้บั๊ก เพิ่มฟีเจอร์ใหม่ๆ ให้ตลอด" },
  { question: "มีภาษาไทยมั้ย?", answer: "มีครับ! รองรับภาษาไทยเต็มรูปแบบ เมนูไทย คู่มือไทย ซัพพอร์ตเป็นภาษาไทย" },
  { question: "จ่ายยังไงได้บ้าง?", answer: "โอนเงินผ่านบัญชีธนาคารหรือพร้อมเพย์ แล้วแจ้งสลิปในหน้าชำระเงินได้เลย" },
];

const defaults = {
  title: "คำถามที่ถามบ่อย",
  description: "มีคำถามอื่นๆ อีก? ทักมาถามได้เลยนะ",
  items: defaultFaqs,
};

interface FAQProps {
  data?: Record<string, unknown>;
}

export function FAQ({ data }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const d = { ...defaults, ...data } as typeof defaults;
  const items = (d.items || defaultFaqs) as typeof defaultFaqs;

  return (
    <section id="faq" className="py-20 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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

        <div className="mt-12 space-y-4">
          {items.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-slate-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-slate-500 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-slate-200 px-6 py-4 dark:border-slate-700"
                >
                  <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
