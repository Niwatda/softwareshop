"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus, Trash2, Save, Eye, EyeOff, GripVertical,
  Type, Image, Video, Link2, Heading, AlignLeft,
  ArrowUp, ArrowDown, ExternalLink, ChevronLeft,
} from "lucide-react";

interface Block {
  id: string;
  type: "heading" | "text" | "image" | "video" | "link" | "spacer";
  content: string;
  meta?: Record<string, string>;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: Block[];
  isPublished: boolean;
  sortOrder: number;
}

const newId = () => Math.random().toString(36).slice(2, 10);

const BLOCK_TYPES = [
  { type: "heading", label: "หัวข้อ", icon: Heading },
  { type: "text", label: "ข้อความ", icon: AlignLeft },
  { type: "image", label: "รูปภาพ", icon: Image },
  { type: "video", label: "วิดีโอ", icon: Video },
  { type: "link", label: "ลิงก์/ปุ่ม", icon: Link2 },
  { type: "spacer", label: "เว้นระยะ", icon: GripVertical },
] as const;

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPages = useCallback(async () => {
    const res = await fetch("/api/admin/pages");
    const data = await res.json();
    setPages(data.pages || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const startNew = () => {
    setEditing({
      id: "",
      title: "",
      slug: "",
      blocks: [],
      isPublished: false,
      sortOrder: pages.length,
    });
    setError("");
  };

  const startEdit = (page: Page) => {
    setEditing({ ...page, blocks: Array.isArray(page.blocks) ? page.blocks : [] });
    setError("");
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title) { setError("ใส่ชื่อหน้าด้วย"); return; }
    if (!editing.slug) { setError("ใส่ slug ด้วย"); return; }

    setSaving(true);
    setError("");

    const url = editing.id ? `/api/admin/pages?id=${editing.id}` : "/api/admin/pages";
    const method = editing.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editing.title,
        slug: editing.slug,
        blocks: editing.blocks,
        isPublished: editing.isPublished,
        sortOrder: editing.sortOrder,
      }),
    });

    if (res.ok) {
      setEditing(null);
      fetchPages();
    } else {
      const data = await res.json();
      setError(data.error || "บันทึกไม่สำเร็จ");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบหน้านี้เลยนะ?")) return;
    await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
    fetchPages();
  };

  const togglePublish = async (page: Page) => {
    await fetch(`/api/admin/pages?id=${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !page.isPublished }),
    });
    fetchPages();
  };

  const addBlock = (type: Block["type"]) => {
    if (!editing) return;
    const block: Block = { id: newId(), type, content: "", meta: {} };
    if (type === "heading") block.meta = { size: "h2" };
    if (type === "link") block.meta = { url: "#", style: "button" };
    if (type === "image") block.meta = { alt: "", width: "full" };
    if (type === "video") block.meta = { provider: "youtube" };
    if (type === "spacer") block.meta = { height: "40" };
    setEditing({ ...editing, blocks: [...editing.blocks, block] });
  };

  const updateBlock = (idx: number, updates: Partial<Block>) => {
    if (!editing) return;
    const blocks = [...editing.blocks];
    blocks[idx] = { ...blocks[idx], ...updates };
    setEditing({ ...editing, blocks });
  };

  const updateBlockMeta = (idx: number, key: string, value: string) => {
    if (!editing) return;
    const blocks = [...editing.blocks];
    blocks[idx] = { ...blocks[idx], meta: { ...blocks[idx].meta, [key]: value } };
    setEditing({ ...editing, blocks });
  };

  const removeBlock = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, blocks: editing.blocks.filter((_, i) => i !== idx) });
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const blocks = [...editing.blocks];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
    setEditing({ ...editing, blocks });
  };

  const handleImageUpload = async (idx: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      updateBlock(idx, { content: data.url });
    } else {
      alert("อัปโหลดรูปไม่สำเร็จ");
    }
  };

  // === PAGE LIST ===
  if (!editing) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการหน้าเว็บ</h1>
            <p className="text-sm text-gray-500">สร้าง แก้ไข ตกแต่งหน้าเว็บได้เอง</p>
          </div>
          <Button onClick={startNew} className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Plus size={16} /> สร้างหน้าใหม่
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : pages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Type size={48} className="mx-auto mb-4 opacity-30" />
              <p>ยังไม่มีหน้าเว็บ กดปุ่มด้านบนเพื่อสร้าง</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <Card key={page.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{page.title}</h3>
                      {page.isPublished ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">เผยแพร่</span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">ฉบับร่าง</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">/p/{page.slug} · {(page.blocks as Block[]).length} บล็อก</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {page.isPublished && (
                      <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink size={16} /></Button>
                      </a>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => togglePublish(page)}>
                      {page.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(page)}>แก้ไข</Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(page.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // === BLOCK EDITOR ===
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => setEditing(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <ChevronLeft size={16} /> กลับ
        </button>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.isPublished}
              onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
              className="rounded"
            />
            เผยแพร่
          </label>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Save size={16} /> {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <Card className="mb-6">
        <CardHeader><CardTitle>ข้อมูลหน้า</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="ชื่อหน้า"
            value={editing.title}
            onChange={(e) => {
              const title = e.target.value;
              setEditing((prev) => prev ? ({
                ...prev,
                title,
                slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
              }) : prev);
            }}
          />
          <Input
            label="Slug (URL)"
            value={editing.slug}
            onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })}
            placeholder="เช่น about-us"
          />
        </CardContent>
      </Card>

      {/* Block List */}
      <div className="space-y-3 mb-6">
        {editing.blocks.map((block, idx) => (
          <Card key={block.id} className="border-l-4 border-l-violet-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase text-violet-600">
                  {BLOCK_TYPES.find((b) => b.type === block.type)?.label || block.type}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveBlock(idx, -1)} className="p-1 text-gray-400 hover:text-gray-700"><ArrowUp size={14} /></button>
                  <button onClick={() => moveBlock(idx, 1)} className="p-1 text-gray-400 hover:text-gray-700"><ArrowDown size={14} /></button>
                  <button onClick={() => removeBlock(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>

              {block.type === "heading" && (
                <div className="space-y-2">
                  <select
                    value={block.meta?.size || "h2"}
                    onChange={(e) => updateBlockMeta(idx, "size", e.target.value)}
                    className="rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="h1">H1 - ใหญ่สุด</option>
                    <option value="h2">H2 - ใหญ่</option>
                    <option value="h3">H3 - กลาง</option>
                  </select>
                  <input
                    className="w-full rounded-lg border px-3 py-2 text-lg font-bold dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    value={block.content}
                    onChange={(e) => updateBlock(idx, { content: e.target.value })}
                    placeholder="พิมพ์หัวข้อ..."
                  />
                </div>
              )}

              {block.type === "text" && (
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  rows={4}
                  value={block.content}
                  onChange={(e) => updateBlock(idx, { content: e.target.value })}
                  placeholder="พิมพ์เนื้อหา... (รองรับขึ้นบรรทัดใหม่)"
                />
              )}

              {block.type === "image" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={block.content}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      placeholder="วาง URL รูปภาพ หรืออัปโหลด..."
                    />
                    <label className="cursor-pointer rounded-lg bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200">
                      อัปโหลด
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(idx, e.target.files[0]);
                      }} />
                    </label>
                  </div>
                  <Input
                    label="Alt text (คำอธิบายรูป)"
                    value={block.meta?.alt || ""}
                    onChange={(e) => updateBlockMeta(idx, "alt", e.target.value)}
                  />
                  <select
                    value={block.meta?.width || "full"}
                    onChange={(e) => updateBlockMeta(idx, "width", e.target.value)}
                    className="rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="full">เต็มความกว้าง</option>
                    <option value="medium">กลาง (75%)</option>
                    <option value="small">เล็ก (50%)</option>
                  </select>
                  {block.content && (
                    <img src={block.content} alt={block.meta?.alt || ""} className="max-h-48 rounded-lg object-cover" />
                  )}
                </div>
              )}

              {block.type === "video" && (
                <div className="space-y-2">
                  <input
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    value={block.content}
                    onChange={(e) => updateBlock(idx, { content: e.target.value })}
                    placeholder="วาง YouTube URL เช่น https://youtube.com/watch?v=..."
                  />
                  {block.content && getYoutubeId(block.content) && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(block.content)}`}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

              {block.type === "link" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={block.content}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      placeholder="ข้อความบนปุ่ม"
                    />
                    <input
                      className="rounded-lg border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={block.meta?.url || ""}
                      onChange={(e) => updateBlockMeta(idx, "url", e.target.value)}
                      placeholder="URL ปลายทาง เช่น /products/xxx"
                    />
                  </div>
                  <select
                    value={block.meta?.style || "button"}
                    onChange={(e) => updateBlockMeta(idx, "style", e.target.value)}
                    className="rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="button">ปุ่มสี</option>
                    <option value="outline">ปุ่มขอบ</option>
                    <option value="text">ลิงก์ข้อความ</option>
                  </select>
                </div>
              )}

              {block.type === "spacer" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">ความสูง (px):</span>
                  <input
                    type="number"
                    className="w-24 rounded-lg border px-3 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    value={block.meta?.height || "40"}
                    onChange={(e) => updateBlockMeta(idx, "height", e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Block Toolbar */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-medium text-gray-500">เพิ่มบล็อก:</p>
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-violet-500 dark:hover:bg-violet-950/30"
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
