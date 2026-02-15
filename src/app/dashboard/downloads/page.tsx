"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Package, Loader2 } from "lucide-react";
import Link from "next/link";

interface PurchasedProduct {
  id: string;
  name: string;
  version: string;
  downloadUrl: string | null;
}

export default function DownloadsPage() {
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState("");

  useEffect(() => {
    fetch("/api/user/downloads")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = async (productId: string) => {
    setDownloadingId(productId);
    setDownloadProgress("กำลังเตรียมไฟล์...");

    try {
      const res = await fetch(`/api/download/${productId}`);

      // ถ้า redirect (ไฟล์เดียว) - browser จะ follow redirect อัตโนมัติ
      // แต่ถ้าเป็น JSON response (chunked) - ต้อง download แยก
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();

        if (data.type === "chunked" && data.chunks) {
          // ดาวน์โหลดแต่ละ chunk แล้วรวม
          const blobParts: Blob[] = [];
          for (let i = 0; i < data.chunks.length; i++) {
            setDownloadProgress(`กำลังดาวน์โหลด ${i + 1}/${data.chunks.length}...`);
            const chunkRes = await fetch(data.chunks[i]);
            if (!chunkRes.ok) throw new Error(`ดาวน์โหลดชิ้นที่ ${i + 1} ไม่สำเร็จ`);
            const blob = await chunkRes.blob();
            blobParts.push(blob);
          }

          // รวมเป็นไฟล์เดียว
          setDownloadProgress("กำลังรวมไฟล์...");
          const fullBlob = new Blob(blobParts, { type: "application/octet-stream" });
          const url = URL.createObjectURL(fullBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = data.originalName || "download.zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (data.error) {
          alert(data.error);
        }
      } else {
        // ไฟล์เดียว - redirect ไปตรง ๆ
        window.location.href = `/api/download/${productId}`;
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("ดาวน์โหลดไม่สำเร็จ ลองใหม่นะ");
    } finally {
      setDownloadingId(null);
      setDownloadProgress("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ดาวน์โหลดโปรแกรม</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">โปรแกรมที่ซื้อแล้ว โหลดได้เลยที่นี่</p>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">ยังไม่มีโปรแกรมที่ซื้อ</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ไปเลือกซื้อกันก่อน!</p>
              </div>
              <Link href="/#pricing">
                <Button>ดูโปรแกรมทั้งหมด</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/50">
                    <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      เวอร์ชัน {product.version}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {product.downloadUrl ? (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownload(product.id)}
                      disabled={downloadingId === product.id}
                    >
                      {downloadingId === product.id ? (
                        <><Loader2 size={16} className="animate-spin" /> กำลังโหลด...</>
                      ) : (
                        <><Download size={16} /> โหลดเลย</>
                      )}
                    </Button>
                  ) : (
                    <Button size="sm" disabled>
                      กำลังเตรียมไฟล์ให้
                    </Button>
                  )}
                  {downloadingId === product.id && downloadProgress && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">{downloadProgress}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
