import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SoftwareShop - ขายโปรแกรมดีๆ ราคาโดน",
    template: "%s | SoftwareShop",
  },
  description:
    "รวมโปรแกรมคุณภาพ ใช้งานง่าย ราคาเบาๆ ซื้อปุ๊บใช้ได้ปั๊บ โหลดได้เลยทันที",
  keywords: ["โปรแกรม", "ซอฟต์แวร์", "ขายโปรแกรม", "software", "ดาวน์โหลดโปรแกรม"],
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "SoftwareShop",
    title: "SoftwareShop - ขายโปรแกรมดีๆ ราคาโดน",
    description:
      "รวมโปรแกรมคุณภาพ ใช้งานง่าย ราคาเบาๆ ซื้อปุ๊บใช้ได้ปั๊บ โหลดได้เลยทันที",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning translate="no">
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
