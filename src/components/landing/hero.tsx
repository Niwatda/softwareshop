"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const defaults = {
  badge: "เวอร์ชันใหม่ล่าสุด 2.0 มาแล้ว!",
  title: "โปรแกรมดีๆ",
  titleHighlight: "ที่คุณตามหา",
  description: "ใช้ง่าย ทำงานไว ได้ผลจริง ซื้อทีเดียวใช้ได้ตลอด ไม่ต้องจ่ายรายเดือน แถมอัปเดตฟรี!",
  button1: "ดูราคาเลย",
  button2: "ดูว่าทำอะไรได้บ้าง",
  youtubeUrl: "",
};

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&/]+)/);
  return match?.[1] || null;
}

interface HeroProps {
  data?: Record<string, unknown>;
}

export function Hero({ data }: HeroProps) {
  const d = { ...defaults, ...data } as typeof defaults;

  return (
    <section className="relative overflow-hidden bg-slate-900 pt-24 pb-20 sm:pt-32 sm:pb-28">
      {/* Decorative solid shapes */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-violet-900/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-800 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-violet-800 px-4 py-1.5 text-sm font-medium text-violet-200">
              {d.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {d.title}
            <br />
            <span className="text-violet-400">
              {d.titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
          >
            {d.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/#pricing">
              <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
                {d.button1} <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/#features">
              <Button variant="outline" size="lg" className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                <Play size={18} /> {d.button2}
              </Button>
            </Link>
          </motion.div>

          {/* App Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              {d.youtubeUrl && getYouTubeId(d.youtubeUrl) ? (
                <iframe
                  className="aspect-video w-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(d.youtubeUrl)}`}
                  title="วิดีโอตัวอย่าง"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="aspect-video bg-slate-800 flex items-center justify-center">
                  <p className="text-2xl font-semibold text-slate-500">
                    ตัวอย่างหน้าจอโปรแกรม
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
