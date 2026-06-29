const FEATURES = [
  {
    title: "Design → Code",
    description:
      "get_metadata 재귀 수집 후 get_design_context 1회로 Hero·CTA·Footer까지 누락 없이 퍼블합니다.",
    icon: "→",
  },
  {
    title: "Code → Figma",
    description:
      "generate_figma_design 캡처와 use_figma DS 조립을 병렬로 실행해 편집 가능한 Figma 화면을 만듭니다.",
    icon: "←",
  },
  {
    title: "Harness",
    description:
      "Skill · Rule · Prompt 3계층으로 AI 에이전트 호출 순서와 품질 게이트를 고정합니다.",
    icon: "⚡",
  },
] as const;

export function FeatureGrid() {
  return (
    <section id="features" className="mt-16 space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-slate-900">연습 시나리오</h2>
        <p className="text-slate-600">
          아래 3개 섹션이 Figma node-id 재귀·이미지·CTA 테스트에 적합합니다.
        </p>
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
