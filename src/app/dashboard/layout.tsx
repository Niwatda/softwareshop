"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { LayoutDashboard, Download, ShoppingBag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/dashboard/downloads", label: "ดาวน์โหลด", icon: Download },
  { href: "/dashboard/orders", label: "คำสั่งซื้อ", icon: ShoppingBag },
  { href: "/dashboard/settings", label: "ตั้งค่า", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen pt-16">
        <aside className="hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:block">
          <nav className="space-y-1 p-4">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
