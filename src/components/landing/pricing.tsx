"use client";

import { motion } from "framer-motion";
import { Check, Loader2, PackageX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  price: number;
  comparePrice: number | null;
  image: string | null;
  images: string[];
  youtubeUrl: string | null;
  version: string;
}

function formatPriceDisplay(priceInCents: number): string {
  return new Intl.NumberFormat("th-TH").format(priceInCents / 100);
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const loading = null;
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setFetching(false));
  }, []);

  const handlePurchase = (productSlug: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    router.push(`/checkout/${productSlug}`);
  };

  const getPopularIndex = (total: number) => {
    if (total <= 1) return 0;
    if (total === 2) return 1;
    return Math.floor(total / 2);
  };

  const popularIndex = getPopularIndex(products.length);

  return (
    <section id="pricing" className="py-20 bg-slate-100 dark:bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            ราคาเท่าไหร่?
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            จ่ายครั้งเดียว ใช้ได้ตลอด ไม่มีค่ารายเดือน
          </p>
        </motion.div>

        {fetching ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
            <PackageX className="h-12 w-12" />
            <p className="text-lg">ยังไม่มีโปรแกรมวางขาย เร็วๆ นี้นะ!</p>
          </div>
        ) : (
          <div
            className={cn(
              "mt-16 grid gap-8",
              products.length === 1 && "max-w-md mx-auto",
              products.length === 2 && "max-w-3xl mx-auto lg:grid-cols-2",
              products.length >= 3 && "lg:grid-cols-3"
            )}
          >
            {products.map((product, index) => {
              const isPopular = products.length > 1 && index === popularIndex;
              const youtubeId = product.youtubeUrl ? getYoutubeId(product.youtubeUrl) : null;
              const hasMedia = (product.images && product.images.length > 0) || youtubeId;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden",
                    isPopular
                      ? "border-violet-600 shadow-xl dark:border-violet-500 ring-2 ring-violet-600"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  {isPopular && (
                    <div className="absolute right-4 top-4 z-10">
                      <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white">
                        ขายดีสุด!
                      </span>
                    </div>
                  )}

                  {/* รูปหรือวิดีโอ */}
                  {hasMedia && (
                    <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                      {activeVideo === product.id && youtubeId ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0"
                        />
                      ) : (
                        <>
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : youtubeId ? (
                            <img
                              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}

                          {youtubeId && (
                            <button
                              onClick={() => setActiveVideo(product.id)}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
                            >
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110">
                                <Play size={24} className="ml-1" />
                              </div>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {product.description}
                    </p>

                    <div className="mt-6">
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-lg text-slate-400 line-through mr-2">
                          ฿{formatPriceDisplay(product.comparePrice)}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        ฿{formatPriceDisplay(product.price)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400"> / จ่ายครั้งเดียว</span>
                    </div>

                    {product.features.length > 0 && (
                      <ul className="mt-8 space-y-3">
                        {product.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                          >
                            <Check className="h-5 w-5 flex-shrink-0 text-violet-600 dark:text-violet-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto pt-8">
                      <Button
                        className={cn(
                          "w-full",
                          isPopular ? "bg-violet-600 hover:bg-violet-700" : ""
                        )}
                        variant={isPopular ? "default" : "outline"}
                        size="lg"
                        isLoading={loading === product.slug}
                        onClick={() => handlePurchase(product.slug)}
                      >
                        ซื้อเลย
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
