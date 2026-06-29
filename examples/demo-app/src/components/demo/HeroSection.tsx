import Image from "next/image";
import { DEMO_ASSETS } from "@/constants/figma-assets";
import { DemoButton } from "./DemoButton";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2 md:p-12"
    >
      <div className="space-y-6">
        <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Harness Demo
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Figma ↔ Next.js
            <span className="block text-brand-600">양방향 워크플로우</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            이 데모 페이지로 Design → Code 퍼블과 Code → Figma 동기화를
            Cursor + Figma MCP로 연습할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DemoButton href="#features">기능 보기</DemoButton>
          <DemoButton href="#cta" variant="secondary">
            Figma로 보내기
          </DemoButton>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={DEMO_ASSETS.heroIllustration}
          alt="Figma와 코드를 연결하는 일러스트"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}
