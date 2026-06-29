# 예제 앱

`figma-publish` 하네스를 **실제로 연습**할 수 있는 Next.js 데모입니다.

---

## demo-app

| 항목 | 내용 |
| --- | --- |
| **경로** | `examples/demo-app/` |
| **포트** | `3456` |
| **페이지** | Hero + Feature Grid + CTA + Header/Footer |
| **용도** | Code→Figma · Design→Code · node-id 재귀 · 이미지 sync 연습 |

### 5분 시작

```bash
cd examples/demo-app
chmod +x setup.sh && ./setup.sh   # npm install + .cursor/ 하네스 설치
npm run dev                        # http://localhost:3456
```

Cursor에서 **`prompts/TRY-ME.md`** 프롬프트를 복사해 채팅에 붙여넣으세요.

### 추천 순서

1. **시나리오 A** (Code → Figma) — 코드가 이미 있으므로 바로 MCP 쓰기 연습
2. **시나리오 B** (Design → Code) — Figma 결과물로 역퍼블 연습
3. **시나리오 D** — 양방향 검증

---

## 파일 구조

```text
examples/demo-app/
├── setup.sh                 # install + harness
├── prompts/TRY-ME.md        # 붙여넣기 프롬프트
├── src/
│   ├── app/page.tsx
│   ├── components/demo/     # Hero, Features, CTA …
│   └── constants/figma-assets.ts
└── public/images/demo/        # Hero SVG (이미지 sync 연습)
```

---

## MCP 사전 준비

1. Cursor `/add-plugin figma`
2. Settings → Tools & MCP → **figma → Connect**
3. (선택) `FIGMA_API_KEY` — Context MCP용

[docs/MCP_SETUP.md](../docs/MCP_SETUP.md) · [docs/HARNESS_GUIDE.md](../docs/HARNESS_GUIDE.md)
