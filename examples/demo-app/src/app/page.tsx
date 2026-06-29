import { CtaBanner } from "@/components/demo/CtaBanner";
import { FeatureGrid } from "@/components/demo/FeatureGrid";
import { HeroSection } from "@/components/demo/HeroSection";
import { SiteFooter } from "@/components/demo/SiteFooter";
import { SiteHeader } from "@/components/demo/SiteHeader";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 md:px-8">
        <HeroSection />
        <FeatureGrid />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
