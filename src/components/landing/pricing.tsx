"use client";

import { motion } from "framer-motion";
import { Check, Loader2, PackageX, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const defaults = {
  title: "ราคาเท่าไหร่?",
  description: "จ่ายครั้งเดียว ใช้ได้ตลอด ไม่มีค่ารายเดือน",
  buttonText: "ซื้อเลย",
  popularBadge: "ขายดีสุด!",
  perUnit: "/ จ่ายครั้งเดียว",
  detailText: "ดูรายละเอียดเพิ่มเติม",
  detailSub: "ดูวิดีโอตัวอย่าง รูปภาพ และข้อมูลทั้งหมด",
  emptyText: "ยังไม่มีโปรแกรมวางขาย เร็วๆ นี้นะ!",
};

interface PricingProps {
  data?: Record<string, unknown>;
}

export function Pricing({ data }: PricingProps) {
  const d = { ...defaults, ...data } as typeof defaults;
  const { data: session } = useSession();
  const router = useRouter();
  const loading = null;
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => setProducts(res.products || []))
      .catch(() => setProducts([]))
      .finally(() => setFetching(false));
  }, []);

  const handlePurchase = (productSlug: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    router.push(`/checkout/${encodeURIComponent(productSlug)}`);
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
            {d.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {d.description}
          </p>
        </motion.div>

        {fetching ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
            <PackageX className="h-12 w-12" />
            <p className="text-lg">{d.emptyText}</p>
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
              const hasImage = product.images && product.images.length > 0;

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
                        {d.popularBadge}
                      </span>
                    </div>
                  )}

                  {/* แสดงรูปภาพอย่างเดียว (ไม่มีวิดีโอ) */}
                  {hasImage && (
                    <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
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
                      <span className="text-slate-500 dark:text-slate-400"> {d.perUnit}</span>
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

                    <div className="mt-auto pt-8 space-y-3">
                      <Button
                        className="w-full bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700"
                        size="lg"
                        isLoading={loading === product.slug}
                        onClick={() => handlePurchase(product.slug)}
                      >
                        {d.buttonText}
                      </Button>

                      <Link href={`/products/${encodeURIComponent(product.slug)}`} className="block">
                        <div className="rounded-xl border-2 border-violet-600 bg-violet-600 p-3 text-center transition-all hover:bg-violet-700 hover:border-violet-700 dark:border-violet-500 dark:bg-violet-600 dark:hover:bg-violet-700 dark:hover:border-violet-600">
                          <div className="flex items-center justify-center gap-2 font-semibold text-white">
                            <Info size={16} />
                            <span>{d.detailText}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-violet-100">
                            {d.detailSub}
                          </p>
                        </div>
                      </Link>
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
