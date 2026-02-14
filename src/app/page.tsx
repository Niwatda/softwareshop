import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getSiteSettings() {
  try {
    const settings = await db.siteSetting.findMany();
    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return {};
  }
}

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar />
      <main>
        <Hero data={settings.hero as Record<string, unknown> | undefined} />
        <Features data={settings.features as Record<string, unknown> | undefined} />
        <Testimonials data={settings.testimonials as Record<string, unknown> | undefined} />
        <Pricing />
        <FAQ data={settings.faq as Record<string, unknown> | undefined} />
        <CTA data={settings.cta as Record<string, unknown> | undefined} />
      </main>
      <Footer data={settings.footer as Record<string, unknown> | undefined} />
    </>
  );
}
