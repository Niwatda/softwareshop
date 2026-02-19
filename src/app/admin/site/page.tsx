"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Save, Plus, Trash2, Upload } from "lucide-react";

const tabs = [
  { key: "hero", label: "Hero" },
  { key: "features", label: "จุดเด่น" },
  { key: "pricing", label: "ราคา/สินค้า" },
  { key: "testimonials", label: "รีวิว" },
  { key: "faq", label: "FAQ" },
  { key: "cta", label: "CTA" },
  { key: "navbar", label: "Navbar" },
  { key: "footer", label: "Footer" },
  { key: "bank", label: "ธนาคาร" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const defaultValues: Record<TabKey, unknown> = {
  hero: {
    badge: "เวอร์ชันใหม่ล่าสุด 2.0 มาแล้ว!",
    title: "โปรแกรมดีๆ",
    titleHighlight: "ที่คุณตามหา",
    description: "ใช้ง่าย ทำงานไว ได้ผลจริง ซื้อทีเดียวใช้ได้ตลอด ไม่ต้องจ่ายรายเดือน แถมอัปเดตฟรี!",
    button1: "ดูราคาเลย",
    button2: "ดูว่าทำอะไรได้บ้าง",
    youtubeUrl: "",
  },
  features: {
    title: "ทำไมต้องโปรแกรมนี้?",
    description: "เพราะมันช่วยให้ชีวิตง่ายขึ้นจริงๆ",
    items: [
      { icon: "Zap", title: "เร็วมากๆ", description: "เปิดปุ๊บ ใช้ได้ปั๊บ ไม่ต้องรอโหลดนาน ทำงานลื่นไหลไม่มีสะดุด" },
      { icon: "Shield", title: "ปลอดภัย ไร้กังวล", description: "ข้อมูลของคุณเข้ารหัสแน่นหนา ไม่มีหลุด ไม่มีรั่ว ใช้ได้สบายใจ" },
      { icon: "BarChart3", title: "ดูรายงานง่ายๆ", description: "สรุปผลให้อัตโนมัติ ไม่ต้องนั่งทำเอง เข้าใจง่ายในพริบตา" },
      { icon: "Cloud", title: "ใช้ได้ทุกที่", description: "ข้อมูลซิงค์อัตโนมัติ จะอยู่ที่ไหนก็เปิดใช้ได้ ไม่ต้องพก USB" },
      { icon: "Smartphone", title: "ใช้ได้ทุกเครื่อง", description: "จะคอม โน้ตบุ๊ค แท็บเล็ต หรือมือถือ เปิดใช้ได้หมด ไม่มีปัญหา" },
      { icon: "HeadphonesIcon", title: "มีปัญหา ถามได้เลย", description: "ทีมซัพพอร์ตพร้อมช่วยเหลือตลอด ตอบไว ไม่ทิ้งให้รอนาน" },
    ],
  },
  testimonials: {
    title: "คนใช้จริงว่ายังไง?",
    description: "รีวิวจากลูกค้าที่ซื้อไปใช้จริงๆ",
    items: [
      { name: "พี่ต้อม", role: "เจ้าของร้านค้าออนไลน์", content: "ใช้มา 3 เดือนแล้ว ช่วยจัดการงานได้เยอะมาก เมื่อก่อนทำเองหมดเลย ตอนนี้สบายขึ้นเป็นสิบเท่า", rating: 5 },
      { name: "เอ็ม", role: "ฟรีแลนซ์", content: "ตอนแรกลังเลอยู่ แต่ลองซื้อมาใช้แล้วคุ้มมาก ใช้ง่ายด้วย ไม่ต้องเป็นสายเทคก็ใช้ได้", rating: 5 },
      { name: "คุณบอส", role: "ผู้จัดการทีม IT", content: "ลองมาหลายโปรแกรมแล้ว ตัวนี้โอเคสุด ทั้งเรื่องความเร็วและการใช้งาน แถมราคาเบามาก", rating: 5 },
    ],
  },
  faq: {
    title: "คำถามที่ถามบ่อย",
    description: "มีคำถามอื่นๆ อีก? ทักมาถามได้เลยนะ",
    items: [
      { question: "ใช้กับ Windows / Mac / Linux ได้มั้ย?", answer: "ได้หมดเลย! รองรับ Windows 10/11, macOS 12 ขึ้นไป และ Linux (Ubuntu 20.04+) ใช้ได้ทุกระบบ" },
      { question: "ลองใช้ก่อนซื้อได้มั้ย?", answer: "ได้ครับ! มีให้ทดลองใช้ฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต ลองใช้เต็มที่เลย" },
      { question: "ซื้อแล้วไม่ชอบ ขอเงินคืนได้มั้ย?", answer: "ได้แน่นอน! เรามีนโยบายคืนเงินภายใน 30 วัน ถ้าไม่ถูกใจ ขอคืนเงินได้เต็มจำนวนเลย" },
      { question: "อัปเดตบ่อยมั้ย?", answer: "บ่อยครับ! ออกอัปเดตทุก 2 สัปดาห์ แก้บั๊ก เพิ่มฟีเจอร์ใหม่ๆ ให้ตลอด" },
      { question: "มีภาษาไทยมั้ย?", answer: "มีครับ! รองรับภาษาไทยเต็มรูปแบบ เมนูไทย คู่มือไทย ซัพพอร์ตเป็นภาษาไทย" },
      { question: "จ่ายยังไงได้บ้าง?", answer: "โอนเงินผ่านบัญชีธนาคารหรือพร้อมเพย์ แล้วแจ้งสลิปในหน้าชำระเงินได้เลย" },
    ],
  },
  cta: {
    title: "พร้อมลองแล้วยัง?",
    description: "ซื้อวันนี้ ถ้าไม่ชอบคืนเงินได้ภายใน 30 วัน ไม่มีเงื่อนไข!",
    button: "ดูราคาเลย",
  },
  footer: {
    brand: "SoftwareShop",
    description: "โปรแกรมดีๆ ราคาเบาๆ ใช้ง่าย ได้ผลจริง",
    email: "support@softwareshop.com",
    col1Title: "โปรแกรม",
    col1Link1: "จุดเด่น",
    col1Url1: "/#features",
    col1Link2: "ราคา",
    col1Url2: "/#pricing",
    col1Link3: "คำถามที่ถามบ่อย",
    col1Url3: "/#faq",
    col2Title: "ช่วยเหลือ",
    col2Link1: "หน้าหลักของฉัน",
    col2Url1: "/dashboard",
    col2Link2: "ติดต่อเรา",
    col2Url2: "",
    col3Title: "ข้อกำหนด",
    col3Link1: "นโยบายความเป็นส่วนตัว",
    col3Url1: "/privacy",
    col3Link2: "เงื่อนไขการใช้งาน",
    col3Url2: "/terms",
    copyright: "สงวนลิขสิทธิ์",
    copyrightYear: "",
  },
  pricing: {
    title: "ราคาเท่าไหร่?",
    description: "จ่ายครั้งเดียว ใช้ได้ตลอด ไม่มีค่ารายเดือน",
    buttonText: "ซื้อเลย",
    popularBadge: "ขายดีสุด!",
    perUnit: "/ จ่ายครั้งเดียว",
    detailText: "ดูรายละเอียดเพิ่มเติม",
    detailSub: "ดูวิดีโอตัวอย่าง รูปภาพ และข้อมูลทั้งหมด",
    emptyText: "ยังไม่มีโปรแกรมวางขาย เร็วๆ นี้นะ!",
  },
  navbar: {
    brand: "SoftwareShop",
    menu1: "จุดเด่น",
    menu2: "สินค้า",
    menu3: "คำถาม",
    loginText: "เข้าสู่ระบบ",
    registerText: "สมัครเลย",
  },
  bank: {
    accountName: "",
    accountNumber: "",
    bankName: "",
    qrCode: "",
  },
};

export default function AdminSitePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((result) => {
        const merged: Record<string, unknown> = {};
        for (const tab of tabs) {
          merged[tab.key] = result[tab.key] || defaultValues[tab.key];
        }
        setData(merged);
      });
  }, []);

  const currentData = (data[activeTab] || defaultValues[activeTab]) as Record<string, unknown>;

  const updateField = (field: string, value: unknown) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: { ...(prev[activeTab] as Record<string, unknown>), [field]: value },
    }));
  };

  const updateItemField = (field: string, index: number, key: string, value: unknown) => {
    const items = [...((currentData[field] as unknown[]) || [])];
    items[index] = { ...(items[index] as Record<string, unknown>), [key]: value };
    updateField(field, items);
  };

  const addItem = (field: string, template: Record<string, unknown>) => {
    const items = [...((currentData[field] as unknown[]) || []), template];
    updateField(field, items);
  };

  const removeItem = (field: string, index: number) => {
    const items = ((currentData[field] as unknown[]) || []).filter((_, i) => i !== index);
    updateField(field, items);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: activeTab, value: currentData }),
      });
      if (res.ok) {
        setMessage("บันทึกสำเร็จ!");
      } else {
        setMessage("เกิดข้อผิดพลาด");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาด");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const renderHero = () => {
    const d = currentData as { badge: string; title: string; titleHighlight: string; description: string; button1: string; button2: string; youtubeUrl: string };
    return (
      <div className="space-y-4">
        <Input label="Badge Text" value={d.badge || ""} onChange={(e) => updateField("badge", e.target.value)} />
        <Input label="หัวข้อหลัก" value={d.title || ""} onChange={(e) => updateField("title", e.target.value)} />
        <Input label="หัวข้อรอง (สีม่วง)" value={d.titleHighlight || ""} onChange={(e) => updateField("titleHighlight", e.target.value)} />
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">คำอธิบาย</label>
          <textarea
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            rows={3}
            value={d.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="ปุ่ม 1 Text" value={d.button1 || ""} onChange={(e) => updateField("button1", e.target.value)} />
          <Input label="ปุ่ม 2 Text" value={d.button2 || ""} onChange={(e) => updateField("button2", e.target.value)} />
        </div>
        <Input label="YouTube URL (วางลิงก์วิดีโอ ถ้าเว้นว่างจะแสดง placeholder)" placeholder="https://www.youtube.com/watch?v=..." value={d.youtubeUrl || ""} onChange={(e) => updateField("youtubeUrl", e.target.value)} />
      </div>
    );
  };

  const renderFeatures = () => {
    const d = currentData as { title: string; description: string; items: { icon: string; title: string; description: string }[] };
    return (
      <div className="space-y-4">
        <Input label="หัวข้อ Section" value={d.title || ""} onChange={(e) => updateField("title", e.target.value)} />
        <Input label="คำอธิบาย Section" value={d.description || ""} onChange={(e) => updateField("description", e.target.value)} />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">รายการ Features</h4>
            <Button size="sm" onClick={() => addItem("items", { icon: "Zap", title: "", description: "" })} className="gap-1">
              <Plus size={14} /> เพิ่ม
            </Button>
          </div>
          {(d.items || []).map((item, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">#{i + 1}</span>
                  <button onClick={() => removeItem("items", i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
                <Input label="ไอคอน (ชื่อ Lucide)" value={item.icon || ""} onChange={(e) => updateItemField("items", i, "icon", e.target.value)} />
                <Input label="ชื่อ" value={item.title || ""} onChange={(e) => updateItemField("items", i, "title", e.target.value)} />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">รายละเอียด</label>
                  <textarea
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    rows={2}
                    value={item.description || ""}
                    onChange={(e) => updateItemField("items", i, "description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTestimonials = () => {
    const d = currentData as { title: string; description: string; items: { name: string; role: string; content: string; rating: number }[] };
    return (
      <div className="space-y-4">
        <Input label="หัวข้อ Section" value={d.title || ""} onChange={(e) => updateField("title", e.target.value)} />
        <Input label="คำอธิบาย Section" value={d.description || ""} onChange={(e) => updateField("description", e.target.value)} />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">รายการรีวิว</h4>
            <Button size="sm" onClick={() => addItem("items", { name: "", role: "", content: "", rating: 5 })} className="gap-1">
              <Plus size={14} /> เพิ่ม
            </Button>
          </div>
          {(d.items || []).map((item, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">#{i + 1}</span>
                  <button onClick={() => removeItem("items", i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
                <Input label="ชื่อ" value={item.name || ""} onChange={(e) => updateItemField("items", i, "name", e.target.value)} />
                <Input label="ตำแหน่ง/อาชีพ" value={item.role || ""} onChange={(e) => updateItemField("items", i, "role", e.target.value)} />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">เนื้อหารีวิว</label>
                  <textarea
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    rows={3}
                    value={item.content || ""}
                    onChange={(e) => updateItemField("items", i, "content", e.target.value)}
                  />
                </div>
                <Input label="ดาว (1-5)" type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => updateItemField("items", i, "rating", parseInt(e.target.value) || 5)} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderFAQ = () => {
    const d = currentData as { title: string; description: string; items: { question: string; answer: string }[] };
    return (
      <div className="space-y-4">
        <Input label="หัวข้อ Section" value={d.title || ""} onChange={(e) => updateField("title", e.target.value)} />
        <Input label="คำอธิบาย Section" value={d.description || ""} onChange={(e) => updateField("description", e.target.value)} />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">รายการคำถาม</h4>
            <Button size="sm" onClick={() => addItem("items", { question: "", answer: "" })} className="gap-1">
              <Plus size={14} /> เพิ่ม
            </Button>
          </div>
          {(d.items || []).map((item, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">#{i + 1}</span>
                  <button onClick={() => removeItem("items", i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
                <Input label="คำถาม" value={item.question || ""} onChange={(e) => updateItemField("items", i, "question", e.target.value)} />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">คำตอบ</label>
                  <textarea
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    rows={3}
                    value={item.answer || ""}
                    onChange={(e) => updateItemField("items", i, "answer", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCTA = () => {
    const d = currentData as { title: string; description: string; button: string };
    return (
      <div className="space-y-4">
        <Input label="หัวข้อ" value={d.title || ""} onChange={(e) => updateField("title", e.target.value)} />
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">คำอธิบาย</label>
          <textarea
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            rows={2}
            value={d.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
        <Input label="ปุ่ม Text" value={d.button || ""} onChange={(e) => updateField("button", e.target.value)} />
      </div>
    );
  };

  const renderFooter = () => {
    const d = currentData as Record<string, string>;
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">ข้อมูลหลัก</h3>
          <Input label="ชื่อแบรนด์" value={d.brand || ""} onChange={(e) => updateField("brand", e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">คำอธิบาย</label>
            <textarea
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              rows={2}
              value={d.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <Input label="อีเมลติดต่อ" value={d.email || ""} onChange={(e) => updateField("email", e.target.value)} />
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">คอลัมน์ 1</h3>
          <Input label="หัวข้อ" value={d.col1Title || ""} onChange={(e) => updateField("col1Title", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อลิงก์ 1" value={d.col1Link1 || ""} onChange={(e) => updateField("col1Link1", e.target.value)} />
            <Input label="URL ลิงก์ 1" value={d.col1Url1 || ""} onChange={(e) => updateField("col1Url1", e.target.value)} placeholder="เช่น /#features" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อลิงก์ 2" value={d.col1Link2 || ""} onChange={(e) => updateField("col1Link2", e.target.value)} />
            <Input label="URL ลิงก์ 2" value={d.col1Url2 || ""} onChange={(e) => updateField("col1Url2", e.target.value)} placeholder="เช่น /#pricing" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อลิงก์ 3" value={d.col1Link3 || ""} onChange={(e) => updateField("col1Link3", e.target.value)} />
            <Input label="URL ลิงก์ 3" value={d.col1Url3 || ""} onChange={(e) => updateField("col1Url3", e.target.value)} placeholder="เช่น /#faq" />
          </div>
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">คอลัมน์ 2</h3>
          <Input label="หัวข้อ" value={d.col2Title || ""} onChange={(e) => updateField("col2Title", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อลิงก์ 1" value={d.col2Link1 || ""} onChange={(e) => updateField("col2Link1", e.target.value)} />
            <Input label="URL ลิงก์ 1" value={d.col2Url1 || ""} onChange={(e) => updateField("col2Url1", e.target.value)} placeholder="เช่น /dashboard" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อลิงก์ 2" value={d.col2Link2 || ""} onChange={(e) => updateField("col2Link2", e.target.value)} />
            <Input label="URL ลิงก์ 2" value={d.col2Url2 || ""} onChange={(e) => updateField("col2Url2", e.target.value)} placeholder="เช่น mailto:email@x.com หรือ /contact" />
          </div>
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">คอลัมน์ 3</h3>
          <Input label="หัวข้อ" value={d.col3Title || ""} onChange={(e) => updateField("col3Title", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อลิงก์ 1" value={d.col3Link1 || ""} onChange={(e) => updateField("col3Link1", e.target.value)} />
            <Input label="URL ลิงก์ 1" value={d.col3Url1 || ""} onChange={(e) => updateField("col3Url1", e.target.value)} placeholder="เช่น /privacy" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อลิงก์ 2" value={d.col3Link2 || ""} onChange={(e) => updateField("col3Link2", e.target.value)} />
            <Input label="URL ลิงก์ 2" value={d.col3Url2 || ""} onChange={(e) => updateField("col3Url2", e.target.value)} placeholder="เช่น /terms" />
          </div>
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">ด้านล่างสุด</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ปี ค.ศ. (เว้นว่างใช้ปีปัจจุบัน)" value={d.copyrightYear || ""} onChange={(e) => updateField("copyrightYear", e.target.value)} placeholder="เช่น 2026" />
            <Input label="ข้อความสงวนลิขสิทธิ์" value={d.copyright || ""} onChange={(e) => updateField("copyright", e.target.value)} />
          </div>
        </div>
      </div>
    );
  };

  const [uploadingQr, setUploadingQr] = useState(false);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok) {
        updateField("qrCode", result.fileName);
      } else {
        alert(result.error || "อัปโหลดไม่สำเร็จ");
      }
    } catch {
      alert("อัปโหลดไม่สำเร็จ");
    }
    setUploadingQr(false);
  };

  const renderBank = () => {
    const d = currentData as { accountName: string; accountNumber: string; bankName: string; qrCode: string };
    return (
      <div className="space-y-4">
        <Input label="ชื่อบัญชี" placeholder="นายสมชาย ใจดี" value={d.accountName || ""} onChange={(e) => updateField("accountName", e.target.value)} />
        <Input label="เลขบัญชี" placeholder="xxx-x-xxxxx-x" value={d.accountNumber || ""} onChange={(e) => updateField("accountNumber", e.target.value)} />
        <Input label="ชื่อธนาคาร" placeholder="กสิกรไทย, กรุงเทพ, ไทยพาณิชย์ ..." value={d.bankName || ""} onChange={(e) => updateField("bankName", e.target.value)} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">QR Code พร้อมเพย์</label>
          {d.qrCode && (
            <div className="relative w-48">
              <img src={d.qrCode} alt="QR Code" className="rounded-lg border border-gray-200 dark:border-gray-700" />
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            <Upload size={16} />
            {uploadingQr ? "กำลังอัปโหลด..." : "อัปโหลด QR Code"}
            <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} disabled={uploadingQr} />
          </label>
        </div>
      </div>
    );
  };

  const renderPricing = () => {
    const d = currentData as { title: string; description: string; buttonText: string; popularBadge: string; perUnit: string; detailText: string; detailSub: string; emptyText: string };
    return (
      <div className="space-y-4">
        <Input label="หัวข้อ Section" value={d.title || ""} onChange={(e) => updateField("title", e.target.value)} />
        <Input label="คำอธิบาย" value={d.description || ""} onChange={(e) => updateField("description", e.target.value)} />
        <Input label="ข้อความปุ่มซื้อ" value={d.buttonText || ""} onChange={(e) => updateField("buttonText", e.target.value)} />
        <Input label="Badge ขายดี" value={d.popularBadge || ""} onChange={(e) => updateField("popularBadge", e.target.value)} />
        <Input label="ข้อความหลังราคา" value={d.perUnit || ""} onChange={(e) => updateField("perUnit", e.target.value)} />
        <Input label="ข้อความปุ่มดูรายละเอียด" value={d.detailText || ""} onChange={(e) => updateField("detailText", e.target.value)} />
        <Input label="ข้อความย่อยใต้ปุ่มรายละเอียด" value={d.detailSub || ""} onChange={(e) => updateField("detailSub", e.target.value)} />
        <Input label="ข้อความเมื่อยังไม่มีสินค้า" value={d.emptyText || ""} onChange={(e) => updateField("emptyText", e.target.value)} />
      </div>
    );
  };

  const renderNavbar = () => {
    const d = currentData as { brand: string; menu1: string; menu2: string; menu3: string; loginText: string; registerText: string };
    return (
      <div className="space-y-4">
        <Input label="ชื่อแบรนด์ (โลโก้)" value={d.brand || ""} onChange={(e) => updateField("brand", e.target.value)} />
        <div className="grid grid-cols-3 gap-4">
          <Input label="เมนู 1" value={d.menu1 || ""} onChange={(e) => updateField("menu1", e.target.value)} />
          <Input label="เมนู 2" value={d.menu2 || ""} onChange={(e) => updateField("menu2", e.target.value)} />
          <Input label="เมนู 3" value={d.menu3 || ""} onChange={(e) => updateField("menu3", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="ปุ่มเข้าสู่ระบบ" value={d.loginText || ""} onChange={(e) => updateField("loginText", e.target.value)} />
          <Input label="ปุ่มสมัคร" value={d.registerText || ""} onChange={(e) => updateField("registerText", e.target.value)} />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "hero": return renderHero();
      case "features": return renderFeatures();
      case "pricing": return renderPricing();
      case "testimonials": return renderTestimonials();
      case "faq": return renderFAQ();
      case "cta": return renderCTA();
      case "navbar": return renderNavbar();
      case "footer": return renderFooter();
      case "bank": return renderBank();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการหน้าเว็บ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">แก้ไขเนื้อหาหน้า Landing Page ทุก Section</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className={cn("text-sm font-medium", message.includes("สำเร็จ") ? "text-green-600" : "text-red-600")}>
              {message}
            </span>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={16} /> {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tabs.find((t) => t.key === activeTab)?.label}</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
