"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
  ShoppingCart,
  Tag,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string | null;
  features: string[];
  price: number;
  comparePrice: number | null;
  image: string | null;
  images: string[];
  youtubeUrl: string | null;
  version: string;
  updatedAt: string;
}

function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("th-TH").format(priceInCents / 100);
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setProduct(data.product))
      .catch(() => setError("ไม่พบโปรแกรมนี้"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePurchase = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    router.push(`/checkout/${encodeURIComponent(slug)}`);
  };

  // รวม media ทั้งหมด (รูป + วิดีโอ)
  const allImages = product?.images || [];
  const youtubeId = product?.youtubeUrl ? getYoutubeId(product.youtubeUrl) : null;
  const hasDiscount = product?.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product!.comparePrice! - product!.price) / product!.comparePrice!) * 100)
    : 0;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-16 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 pt-16 dark:bg-slate-900">
          <p className="text-lg text-gray-500">{error || "ไม่พบโปรแกรมนี้"}</p>
          <Link href="/#pricing">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} /> กลับหน้าหลัก
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-16 dark:bg-slate-900">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-violet-600 dark:text-slate-400"
          >
            <ArrowLeft size={14} /> กลับหน้าโปรแกรม
          </Link>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* ======== ซ้าย: รูป/วิดีโอ ======== */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* รูปหลัก / วิดีโอ */}
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {showVideo && youtubeId ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                  />
                ) : allImages.length > 0 ? (
                  <>
                    <img
                      src={allImages[currentImage]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-all duration-300"
                    />
                    {youtubeId && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
                      >
                        <Play size={16} /> ดูวิดีโอ
                      </button>
                    )}
                  </>
                ) : youtubeId ? (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110">
                        <Play size={28} className="ml-1" />
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <p>ไม่มีรูปภาพ</p>
                  </div>
                )}

                {/* ปุ่มเลื่อนรูป */}
                {allImages.length > 1 && !showVideo && (
                  <>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {(allImages.length > 1 || youtubeId) && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentImage(i);
                        setShowVideo(false);
                      }}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        currentImage === i && !showVideo
                          ? "border-violet-600 ring-2 ring-violet-200 dark:ring-violet-800"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <img src={img} alt={`รูปที่ ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  {youtubeId && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className={`flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 transition-all ${
                        showVideo
                          ? "border-red-500 ring-2 ring-red-200 dark:ring-red-800"
                          : "border-slate-200 dark:border-slate-700 hover:border-red-400"
                      }`}
                    >
                      <div className="relative h-full w-full">
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/default.jpg`}
                          alt="วิดีโอ"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play size={16} className="text-white" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* ======== ขวา: ข้อมูล ======== */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col"
            >
              {/* ชื่อ + เวอร์ชัน */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    v{product.version}
                  </span>
                </div>
                <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                  {product.name}
                </h1>
                <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                  {product.description}
                </p>
              </div>

              {/* ราคา */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-baseline gap-3">
                  {hasDiscount && (
                    <span className="text-xl text-slate-400 line-through">
                      ฿{formatPrice(product.comparePrice!)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    ฿{formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <Tag size={12} /> ลด {discountPercent}%
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">จ่ายครั้งเดียว ใช้ได้ตลอดชีพ</p>

                <Button
                  className="mt-4 w-full gap-2 bg-violet-600 hover:bg-violet-700"
                  size="lg"
                  onClick={handlePurchase}
                >
                  <ShoppingCart size={18} /> ซื้อเลย
                </Button>
              </div>

              {/* จุดเด่น */}
              {product.features.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">จุดเด่น</h2>
                  <ul className="mt-3 space-y-2.5">
                    {product.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-slate-600 dark:text-slate-400"
                      >
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* ======== รายละเอียดเพิ่มเติม ======== */}
          {product.longDescription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                รายละเอียดเพิ่มเติม
              </h2>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
                <div className="prose prose-slate max-w-none dark:prose-invert whitespace-pre-line text-slate-600 dark:text-slate-400">
                  {product.longDescription}
                </div>
              </div>
            </motion.div>
          )}

          {/* วิดีโอตัวอย่าง (แบบเต็ม) */}
          {youtubeId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                วิดีโอตัวอย่าง
              </h2>
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-700">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
