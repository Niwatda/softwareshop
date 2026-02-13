"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          : "bg-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className={`text-xl font-bold ${scrolled ? "text-violet-700 dark:text-violet-400" : "text-white"}`}>
            SoftwareShop
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/#features" className={`text-sm ${scrolled ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" : "text-slate-300 hover:text-white"}`}>
              จุดเด่น
            </Link>
            <Link href="/#pricing" className={`text-sm ${scrolled ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" : "text-slate-300 hover:text-white"}`}>
              ราคา
            </Link>
            <Link href="/#faq" className={`text-sm ${scrolled ? "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" : "text-slate-300 hover:text-white"}`}>
              คำถาม
            </Link>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`rounded-lg p-2 ${scrolled ? "hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {session ? (
              <div className="flex items-center gap-3">
                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant={scrolled ? "ghost" : "secondary"} size="sm">
                      <Shield size={16} className="mr-1" /> จัดการ
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant={scrolled ? "ghost" : "secondary"} size="sm">
                    <LayoutDashboard size={16} className="mr-1" /> หน้าหลัก
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()} className={scrolled ? "" : "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"}>
                  <LogOut size={16} className="mr-1" /> ออกจากระบบ
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className={scrolled ? "" : "text-slate-300 hover:bg-slate-800 hover:text-white"}>เข้าสู่ระบบ</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">สมัครเลย</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden rounded-lg p-2 ${scrolled ? "hover:bg-slate-100 dark:hover:bg-slate-800" : "text-white hover:bg-slate-800"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              <Link href="/#features" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                จุดเด่น
              </Link>
              <Link href="/#pricing" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                ราคา
              </Link>
              <Link href="/#faq" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                คำถาม
              </Link>
              <hr className="border-slate-200 dark:border-slate-700" />
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                    หน้าหลัก
                  </Link>
                  <button onClick={() => signOut()} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                    เข้าสู่ระบบ
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700" size="sm">สมัครเลย</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
