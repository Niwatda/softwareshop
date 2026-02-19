"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface Block {
  id: string;
  type: "heading" | "text" | "image" | "video" | "link" | "spacer";
  content: string;
  meta?: Record<string, string>;
}

interface PageData {
  title: string;
  blocks: Block[];
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const size = block.meta?.size || "h2";
      const cls =
        size === "h1" ? "text-4xl sm:text-5xl font-bold" :
        size === "h2" ? "text-3xl sm:text-4xl font-bold" :
        "text-2xl sm:text-3xl font-semibold";
      return <div className={`${cls} text-slate-900 dark:text-white`}>{block.content}</div>;
    }

    case "text":
      return (
        <div className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
          {block.content}
        </div>
      );

    case "image": {
      const w = block.meta?.width === "small" ? "max-w-lg" : block.meta?.width === "medium" ? "max-w-3xl" : "max-w-full";
      return (
        <div className={`${w} mx-auto`}>
          <img
            src={block.content}
            alt={block.meta?.alt || ""}
            className="w-full rounded-2xl shadow-lg"
          />
          {block.meta?.alt && (
            <p className="mt-2 text-center text-sm text-slate-500">{block.meta.alt}</p>
          )}
        </div>
      );
    }

    case "video": {
      const vid = getYoutubeId(block.content);
      if (!vid) return null;
      return (
        <div className="aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${vid}`}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      );
    }

    case "link": {
      const style = block.meta?.style || "button";
      const isExternal = block.meta?.url?.startsWith("http");
      const cls =
        style === "button"
          ? "inline-block rounded-xl bg-violet-600 px-8 py-3 font-semibold text-white shadow-lg hover:bg-violet-700 transition-all"
          : style === "outline"
          ? "inline-block rounded-xl border-2 border-violet-600 px-8 py-3 font-semibold text-violet-600 hover:bg-violet-50 transition-all dark:text-violet-400 dark:hover:bg-violet-950/30"
          : "inline-block text-violet-600 font-semibold underline hover:text-violet-800 dark:text-violet-400";

      if (isExternal) {
        return (
          <div className="text-center">
            <a href={block.meta?.url || "#"} target="_blank" rel="noopener noreferrer" className={cls}>
              {block.content}
            </a>
          </div>
        );
      }
      return (
        <div className="text-center">
          <Link href={block.meta?.url || "#"} className={cls}>
            {block.content}
          </Link>
        </div>
      );
    }

    case "spacer":
      return <div style={{ height: `${block.meta?.height || 40}px` }} />;

    default:
      return null;
  }
}

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/pages/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setPage(data.page))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          )}

          {notFound && (
            <div className="py-20 text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">404</h1>
              <p className="mt-2 text-slate-500">ไม่พบหน้านี้</p>
              <Link href="/" className="mt-4 inline-block text-violet-600 underline">กลับหน้าแรก</Link>
            </div>
          )}

          {page && (
            <article className="space-y-8">
              {(page.blocks as Block[]).map((block) => (
                <RenderBlock key={block.id} block={block} />
              ))}
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
