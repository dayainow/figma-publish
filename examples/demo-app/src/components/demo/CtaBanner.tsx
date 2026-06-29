import { DemoButton } from "./DemoButton";

export function CtaBanner() {
  return (
    <section
      id="cta"
      className="mt-16 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-10 text-white md:px-12"
    >
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">지금 Cursor에서 시도해 보세요</h2>
          <p className="max-w-xl text-brand-50">
            dev server를 켠 뒤 prompts/TRY-ME.md 프롬프트를 붙여넣으면 Code →
            Figma 연습을 바로 시작할 수 있습니다.
          </p>
        </div>
        <DemoButton href="https://github.com/dayainow/figma-publish" variant="secondary">
          GitHub 보기
        </DemoButton>
      </div>
    </section>
  );
}
