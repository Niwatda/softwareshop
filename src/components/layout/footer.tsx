import Link from "next/link";

const defaults = {
  brand: "SoftwareShop",
  description: "โปรแกรมดีๆ ราคาเบาๆ ใช้ง่าย ได้ผลจริง",
  email: "support@softwareshop.com",
};

interface FooterProps {
  data?: Record<string, unknown>;
}

export function Footer({ data }: FooterProps) {
  const d = { ...defaults, ...data } as typeof defaults;

  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {d.brand}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {d.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white">โปรแกรม</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#features" className="text-sm text-slate-400 hover:text-white">จุดเด่น</Link></li>
              <li><Link href="/#pricing" className="text-sm text-slate-400 hover:text-white">ราคา</Link></li>
              <li><Link href="/#faq" className="text-sm text-slate-400 hover:text-white">คำถามที่ถามบ่อย</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">ช่วยเหลือ</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">หน้าหลักของฉัน</Link></li>
              <li><a href={`mailto:${d.email}`} className="text-sm text-slate-400 hover:text-white">ติดต่อเรา</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">ข้อกำหนด</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white">เงื่อนไขการใช้งาน</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {d.brand} สงวนลิขสิทธิ์
          </p>
        </div>
      </div>
    </footer>
  );
}
