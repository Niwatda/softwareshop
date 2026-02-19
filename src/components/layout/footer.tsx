import Link from "next/link";

const defaults = {
  brand: "SoftwareShop",
  description: "โปรแกรมดีๆ ราคาเบาๆ ใช้ง่าย ได้ผลจริง",
  email: "support@softwareshop.com",
  col1Title: "โปรแกรม",
  col1Link1: "จุดเด่น",
  col1Link2: "ราคา",
  col1Link3: "คำถามที่ถามบ่อย",
  col2Title: "ช่วยเหลือ",
  col2Link1: "หน้าหลักของฉัน",
  col2Link2: "ติดต่อเรา",
  col3Title: "ข้อกำหนด",
  col3Link1: "นโยบายความเป็นส่วนตัว",
  col3Link2: "เงื่อนไขการใช้งาน",
  copyright: "สงวนลิขสิทธิ์",
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
            <h4 className="font-semibold text-white">{d.col1Title}</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#features" className="text-sm text-slate-400 hover:text-white">{d.col1Link1}</Link></li>
              <li><Link href="/#pricing" className="text-sm text-slate-400 hover:text-white">{d.col1Link2}</Link></li>
              <li><Link href="/#faq" className="text-sm text-slate-400 hover:text-white">{d.col1Link3}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">{d.col2Title}</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">{d.col2Link1}</Link></li>
              <li><a href={`mailto:${d.email}`} className="text-sm text-slate-400 hover:text-white">{d.col2Link2}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">{d.col3Title}</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white">{d.col3Link1}</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white">{d.col3Link2}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {d.brand} {d.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
