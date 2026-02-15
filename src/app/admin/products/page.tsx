"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Upload, FileCheck, Pencil, X,
  ImagePlus, Youtube, Eye, EyeOff,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

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
  downloadUrl: string | null;
  version: string;
  isActive: boolean;
  _count: { orders: number };
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  price: "",
  comparePrice: "",
  features: "",
  version: "1.0.0",
  downloadUrl: "",
  youtubeUrl: "",
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImages([]);
    setUploadedFileName("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      longDescription: product.longDescription || "",
      price: String(product.price / 100),
      comparePrice: product.comparePrice ? String(product.comparePrice / 100) : "",
      features: product.features.join("\n"),
      version: product.version,
      downloadUrl: product.downloadUrl || "",
      youtubeUrl: product.youtubeUrl || "",
      isActive: product.isActive,
    });
    setImages(product.images || []);
    setUploadedFileName(product.downloadUrl || "");
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      // 1. ขอข้อมูล upload จาก server (admin-only)
      const signedRes = await fetch("/api/admin/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          bucket: "programs",
        }),
      });
      const signedData = await signedRes.json();
      if (!signedRes.ok) {
        setError(signedData.error || "สร้าง upload URL ไม่สำเร็จ");
        alert(signedData.error || "สร้าง upload URL ไม่สำเร็จ");
        return;
      }

      // 2. ใช้ TUS resumable upload ตรงไป Supabase Storage (รองรับถึง 5GB)
      const { Upload } = await import("tus-js-client");

      await new Promise<void>((resolve, reject) => {
        const upload = new Upload(file, {
          endpoint: `${signedData.supabaseUrl}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${signedData.uploadToken}`,
            "x-upsert": "false",
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: signedData.bucket,
            objectName: signedData.path,
            contentType: file.type || "application/octet-stream",
            cacheControl: "3600",
          },
          chunkSize: 6 * 1024 * 1024, // 6MB chunks
          onError: (err) => {
            console.error("TUS upload error:", err);
            reject(err);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percent = Math.round((bytesUploaded / bytesTotal) * 100);
            setUploadProgress(percent);
          },
          onSuccess: () => {
            resolve();
          },
        });

        // เริ่ม upload
        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }
          upload.start();
        });
      });

      // 3. เก็บ path สำหรับ download
      setUploadedFileName(file.name);
      setForm((f) => ({ ...f, downloadUrl: signedData.path }));

    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setError(`อัปโหลดไม่สำเร็จ: ${errMsg}`);
      alert(`อัปโหลดไม่สำเร็จ: ${errMsg}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("type", "image");

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          newImages.push(data.fileName);
        } else {
          alert(`อัปโหลด ${files[i].name} ไม่สำเร็จ: ${data.error}`);
        }
      } catch {
        alert(`อัปโหลด ${files[i].name} ไม่สำเร็จ`);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploadingImage(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      longDescription: form.longDescription || null,
      price: Math.round(parseFloat(form.price) * 100),
      comparePrice: form.comparePrice ? Math.round(parseFloat(form.comparePrice) * 100) : null,
      features: form.features.split("\n").filter(Boolean),
      version: form.version,
      downloadUrl: form.downloadUrl,
      youtubeUrl: form.youtubeUrl || null,
      images,
      image: images[0] || null,
      isActive: form.isActive,
    };

    try {
      const url = editingId
        ? `/api/admin/products?id=${editingId}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeForm();
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || `บันทึกไม่สำเร็จ (${res.status})`);
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่นะ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบโปรแกรมนี้เลยนะ?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleToggleActive = async (product: Product) => {
    await fetch(`/api/admin/products?id=${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        slug: product.slug,
        description: product.description,
        longDescription: product.longDescription,
        price: product.price,
        isActive: !product.isActive,
        features: product.features,
        images: product.images,
        image: product.image,
        youtubeUrl: product.youtubeUrl,
        downloadUrl: product.downloadUrl,
        version: product.version,
        comparePrice: product.comparePrice,
      }),
    });
    fetchProducts();
  };

  const textareaClass =
    "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการโปรแกรม</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">เพิ่ม แก้ไข ลบโปรแกรมที่ขาย</p>
        </div>
        {!showForm && (
          <Button onClick={openCreateForm} className="gap-2">
            <Plus size={16} /> เพิ่มโปรแกรม
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? "แก้ไขโปรแกรม" : "เพิ่มโปรแกรมใหม่"}
              </h2>
              <button onClick={closeForm} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="ชื่อโปรแกรม"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Slug (ภาษาอังกฤษ ไม่มีเว้นวรรค)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="เช่น my-program"
                required
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">คำอธิบาย</label>
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="เขียนรายละเอียดโปรแกรมให้ลูกค้าเข้าใจ"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  รายละเอียดเพิ่มเติม (แสดงในหน้าข้อมูลโปรแกรม)
                </label>
                <textarea
                  className={textareaClass}
                  rows={6}
                  value={form.longDescription}
                  onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                  placeholder={"เขียนรายละเอียดแบบเต็ม เช่น วิธีการใช้งาน, ความต้องการของระบบ, ข้อดี ฯลฯ\nจะแสดงในหน้ารายละเอียดโปรแกรมแบบเต็ม"}
                />
                <p className="mt-1 text-xs text-gray-400">ข้อมูลนี้จะแสดงในหน้า /products/ชื่อ-slug เท่านั้น</p>
              </div>
              <Input
                label="ราคา (บาท)"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="เช่น 1490"
                required
              />
              <Input
                label="ราคาเปรียบเทียบ (บาท) - ถ้ามีโปร"
                type="number"
                value={form.comparePrice}
                onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                placeholder="เช่น 2990 (ราคาเดิม)"
              />
              <Input
                label="เวอร์ชัน"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
              />

              {/* สถานะ */}
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    เปิดขาย
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">จุดเด่น (บรรทัดละ 1 อย่าง)</label>
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder={"ใช้งานง่าย\nเร็วมาก\nอัปเดตฟรี"}
                />
              </div>

              {/* รูปภาพ */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <ImagePlus size={14} className="mr-1 inline" />
                  รูปภาพโปรแกรม (เลือกได้หลายรูป)
                </label>
                <div className="mt-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    onChange={handleUploadImage}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    isLoading={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImagePlus size={16} /> เลือกรูป
                  </Button>
                </div>

                {images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="group relative">
                        <img
                          src={img}
                          alt={`รูปที่ ${i + 1}`}
                          className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
                            หลัก
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">รูปแรกจะเป็นรูปหลัก | รองรับ JPG, PNG, WebP, GIF (สูงสุด 5MB)</p>
              </div>

              {/* วิดีโอตัวอย่างโปรแกรม */}
              <div className="sm:col-span-2 rounded-lg border border-dashed border-red-200 bg-red-50/50 p-4 dark:border-red-800/50 dark:bg-red-950/20">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Youtube size={18} className="text-red-500" />
                  วิดีโอตัวอย่างโปรแกรม (YouTube)
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  วางลิงก์วิดีโอ YouTube เพื่อให้ลูกค้าดูตัวอย่างโปรแกรมก่อนซื้อ
                </p>
                <div className="mt-2">
                  <Input
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    placeholder="วาง URL เช่น https://www.youtube.com/watch?v=xxxxx หรือ https://youtu.be/xxxxx"
                  />
                </div>
                {form.youtubeUrl && getYoutubeId(form.youtubeUrl) && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <iframe
                      width="100%"
                      height="300"
                      src={`https://www.youtube.com/embed/${getYoutubeId(form.youtubeUrl)}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                )}
                {form.youtubeUrl && !getYoutubeId(form.youtubeUrl) && (
                  <p className="mt-2 text-xs text-red-500">
                    ลิงก์ YouTube ไม่ถูกต้อง ลองใช้แบบ https://www.youtube.com/watch?v=xxxxx
                  </p>
                )}
              </div>

              {/* อัปโหลดไฟล์โปรแกรม */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ไฟล์โปรแกรม (ที่จะให้ลูกค้าโหลด)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleUploadFile}
                    className="hidden"
                    accept=".zip,.rar,.exe,.msi,.dmg,.pkg,.tar.gz,.7z"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    isLoading={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} /> {uploading ? `กำลังอัปโหลด ${uploadProgress}%` : "เลือกไฟล์"}
                  </Button>
                  {uploadedFileName && !uploading && (
                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <FileCheck size={16} /> {uploadedFileName.split("/").pop()}
                    </span>
                  )}
                </div>
                {uploading && uploadProgress > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  รองรับ .zip .rar .exe .msi .dmg .pkg .tar.gz .7z (ไม่จำกัดขนาด)
                </p>
              </div>

              {error && (
                <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-end gap-3 sm:col-span-2">
                <Button type="submit" isLoading={saving}>
                  {editingId ? "อัปเดต" : "บันทึก"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              ยังไม่มีโปรแกรม กดเพิ่มโปรแกรมเลย!
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 px-6 py-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <ImagePlus size={20} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                      {product.youtubeUrl && (
                        <Youtube size={14} className="flex-shrink-0 text-red-500" />
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>v{product.version}</span>
                      <span>|</span>
                      <span>{formatPrice(product.price)}</span>
                      <span>|</span>
                      <span>{product._count.orders} ขายแล้ว</span>
                      {product.images?.length > 0 && (
                        <>
                          <span>|</span>
                          <span>{product.images.length} รูป</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Badge variant={product.isActive ? "success" : "secondary"}>
                      {product.isActive ? "ขายอยู่" : "ปิดขาย"}
                    </Badge>
                    <Badge variant={product.downloadUrl ? "success" : "warning"}>
                      {product.downloadUrl ? "มีไฟล์" : "ไม่มีไฟล์"}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(product)}
                      title={product.isActive ? "ปิดขาย" : "เปิดขาย"}
                    >
                      {product.isActive ? (
                        <EyeOff size={16} className="text-gray-400" />
                      ) : (
                        <Eye size={16} className="text-green-500" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(product)}>
                      <Pencil size={16} className="text-indigo-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
