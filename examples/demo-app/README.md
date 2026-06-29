# Demo App — Figma Publish Harness 연습

하네스를 **손으로 한 번 돌려보는** 예제 Next.js 앱입니다.

---

## 1. 셋업 (한 번)

```bash
cd examples/demo-app
chmod +x setup.sh && ./setup.sh
```

- `npm install`
- `../../install.sh .` → `.cursor/skills`, `.cursor/rules`, `.cursor/prompts` 설치

## 2. 실행

```bash
npm run dev
```

브라우저: **http://localhost:3456**

## 3. Cursor에서 연습

1. `/add-plugin figma` + MCP Connect
2. `prompts/TRY-ME.md` 열기
3. **시나리오 A** 프롬프트 복사 → Figma URL 넣고 채팅 전송

---

## 페이지 구성

```
┌─────────────────────────────────────┐
│ SiteHeader (nav)                    │
├─────────────────────────────────────┤
│ HeroSection                         │
│  · badge · title · 2 buttons        │
│  · hero image (SVG)  ← 이미지 연습   │
├─────────────────────────────────────┤
│ FeatureGrid (3 cards)               │
├─────────────────────────────────────┤
│ CtaBanner (gradient + button)       │
├─────────────────────────────────────┤
│ SiteFooter                          │
└─────────────────────────────────────┘
```

---

## 컴포넌트

| 컴포넌트 | 파일 |
| --- | --- |
| `DemoButton` | `src/components/demo/DemoButton.tsx` |
| `HeroSection` | `src/components/demo/HeroSection.tsx` |
| `FeatureGrid` | `src/components/demo/FeatureGrid.tsx` |
| `CtaBanner` | `src/components/demo/CtaBanner.tsx` |
| `SiteHeader` | `src/components/demo/SiteHeader.tsx` |
| `SiteFooter` | `src/components/demo/SiteFooter.tsx` |

---

## 관련 문서

- [TRY-ME.md](./prompts/TRY-ME.md) — 붙여넣기 프롬프트
- [CODE_TO_FIGMA.md](../../docs/CODE_TO_FIGMA.md)
- [WORKFLOW.md](../../docs/WORKFLOW.md)
