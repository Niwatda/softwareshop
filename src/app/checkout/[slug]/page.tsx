"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
}

interface BankInfo {
  accountName: string;
  accountNumber: string;
  bankName: string;
  qrCode: string;
}

function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("th-TH").format(priceInCents / 100);
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [bank, setBank] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`/api/products/${slug}`).then((r) => r.json()),
      fetch("/api/site-settings").then((r) => r.json()),
    ])
      .then(([productData, settings]) => {
        setProduct(productData.product || null);
        setBank((settings.bank as BankInfo) || null);
      })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [slug, sessionStatus, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }

    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async () => {
    if (!slipFile || !product) return;

    setSubmitting(true);
    setError("");

    try {
      // 1. อัปโหลดสลิป
      const formData = new FormData();
      formData.append("file", slipFile);
      const uploadRes = await fetch("/api/upload/slip", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error || "อัปโหลดสลิปไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      // 2. สร้าง Order
      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: slug, slipImage: uploadData.fileName }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || "แจ้งชำระเงินไม่สำเร็จ");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard/orders");
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-gray-500">ไม่พบสินค้า</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-900">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">ชำระเงิน</h1>

        {/* ข้อมูลสินค้า */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">สินค้าที่สั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
              <span className="text-xl font-bold text-violet-600">฿{formatPrice(product.price)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลธนาคาร */}
        {bank && (bank.accountName || bank.qrCode) ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">โอนเงินมาที่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bank.bankName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ธนาคาร</span>
                  <span className="font-medium text-gray-900 dark:text-white">{bank.bankName}</span>
                </div>
              )}
              {bank.accountNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">เลขบัญชี</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">{bank.accountNumber}</span>
                </div>
              )}
              {bank.accountName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ชื่อบัญชี</span>
                  <span className="font-medium text-gray-900 dark:text-white">{bank.accountName}</span>
                </div>
              )}
              {bank.qrCode && (
                <div className="flex justify-center pt-4">
                  <img src={bank.qrCode} alt="QR Code" className="max-w-[250px] rounded-lg border border-gray-200 dark:border-gray-700" />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="py-8 text-center text-gray-500">
              ยังไม่มีข้อมูลบัญชีธนาคาร กรุณาติดต่อ admin
            </CardContent>
          </Card>
        )}

        {/* อัปโหลดสลิป */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">แจ้งชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">โอนเงินแล้ว อัปโหลดสลิปเพื่อยืนยันการชำระเงิน</p>

            {slipPreview ? (
              <div className="space-y-3">
                <div className="relative mx-auto max-w-[200px]">
                  <img src={slipPreview} alt="สลิป" className="rounded-lg border border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                  >
                    <span className="block h-4 w-4 text-center text-xs leading-4">✕</span>
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle size={16} />
                  <span>เลือกสลิปแล้ว</span>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 transition-colors hover:border-violet-400 hover:bg-violet-50/50 dark:border-gray-700 dark:hover:border-violet-600 dark:hover:bg-violet-950/20">
                <Upload className="h-10 w-10 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">คลิกเพื่ออัปโหลดสลิป</span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP (สูงสุด 5MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            {error && <p className="text-center text-sm text-red-500">{error}</p>}

            <Button
              className="w-full"
              size="lg"
              disabled={!slipFile || submitting}
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {submitting ? "กำลังส่ง..." : "แจ้งชำระเงิน"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
