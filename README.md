<div align="center">

# Figma Publish Harness

**Cursor AI + Figma MCP**로 Figma ↔ Next.js **양방향** 디자인-코드 워크플로우를 표준화한 하네스 패키지입니다.

[![Cursor](https://img.shields.io/badge/Cursor-AI%20IDE-000000?style=flat-square)](https://cursor.com/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-6366F1?style=flat-square)](https://modelcontextprotocol.io/)
[![Figma](https://img.shields.io/badge/Figma-MCP%20연동-F24E1E?style=flat-square&logo=figma&logoColor=white)](https://www.figma.com/)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Design → Code](./docs/WORKFLOW.md) · [Code → Figma](./docs/CODE_TO_FIGMA.md) · [MCP 설정](./docs/MCP_SETUP.md) · [아키텍처](./docs/ARCHITECTURE.md) · [이력서](./docs/RESUME.md)

</div>

---

## 양방향 워크플로우

```text
        Design → Code (퍼블)                    Code → Design (동기화)
        ─────────────────────                    ─────────────────────────
Figma ──► get_variable_defs                    Next.js ──► generate_figma_design
      ──► get_metadata (node-id 재귀)                    ──► use_figma (DS 조립)
      ──► get_design_context                             ──► search_design_system
      ──► Next.js + Tailwind 코드                        ──► Figma 화면
```

| 방향 | Skill | Prompt | 문서 |
| --- | --- | --- | --- |
| **Figma → Code** | `figma-dev` | `figma-publish.md` | [WORKFLOW.md](./docs/WORKFLOW.md) |
| **Code → Figma** | `figma-sync` | `figma-sync-to-design.md` | [CODE_TO_FIGMA.md](./docs/CODE_TO_FIGMA.md) |

---

## 왜 필요한가

AI 에이전트로 Figma ↔ 코드 변환을 할 때, **담당자·프롬프트·MCP 호출 방식**이 제각각이면 품질 편차·UI 누락·토큰 낭비가 반복됩니다.

| Pain Point | 해결 |
| --- | --- |
| Figma → 코드 품질 편차 | `figma-dev` Skill + MCP 읽기 1회 원칙 |
| 루트 node-id만 조회 시 CTA·푸터 누락 | `get_metadata` **전 깊이 재귀** |
| 코드 → Figma가 스크린샷만 남김 | `use_figma` + DS INSTANCE 병렬 조립 |
| 이미지 있는 웹앱 Figma import 실패 | `generate_figma_design` + `imageHash` 이전 |
| MCP 과다 호출 | 도구별 사용 기준·토큰 최적화 |
| 온보딩 비용 | `install.sh` 한 번으로 `.cursor/` 셋업 |

---

## Quick Start

### 1. 설치

```bash
git clone https://github.com/dayainow/figma-publish.git /tmp/figma-publish
/tmp/figma-publish/install.sh .
```

### 2. MCP 연결

1. Cursor → `/add-plugin figma` → **Settings → Tools & MCP → figma → Connect**
2. [Figma PAT](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens) → `FIGMA_API_KEY` 환경 변수
3. Cursor 재시작

상세: [docs/MCP_SETUP.md](./docs/MCP_SETUP.md)

### 예제로 연습하기 (추천)

```bash
git clone https://github.com/dayainow/figma-publish.git
cd figma-publish/examples/demo-app
chmod +x setup.sh && ./setup.sh
npm run dev   # http://localhost:3456
```

→ `examples/demo-app/prompts/TRY-ME.md` 프롬프트를 Cursor 채팅에 붙여넣기.  
가이드: [examples/README.md](./examples/README.md)

### 3-A. Figma → Code (퍼블)

`cursor/prompts/figma-publish.md`:

```text
이 Figma 프레임을 Next.js App Router + Tailwind로 구현해줘.
Figma: <URL>
1. get_variable_defs → 2. get_metadata (재귀) → 3. get_design_context 1회
```

### 3-B. Code → Figma (동기화)

`cursor/prompts/figma-sync-to-design.md`:

```text
이 Next.js 페이지를 Figma로 옮겨줘.
소스: src/app/.../page.tsx  URL: http://localhost:3000/...
Figma: <URL>
병렬: generate_figma_design 캡처 + use_figma DS 조립 → 캡처 레이어 삭제
```

---

## 패키지 구조

```text
figma-publish/
├── README.md
├── install.sh
├── examples/
│   ├── README.md
│   └── demo-app/                    # 연습용 Next.js 앱 (port 3456)
│       ├── setup.sh
│       ├── prompts/TRY-ME.md
│       └── src/...
├── mcp.project.json.example
├── docs/
│   ├── WORKFLOW.md              # Design → Code
│   ├── CODE_TO_FIGMA.md         # Code → Design  ← NEW
│   ├── MCP_SETUP.md
│   ├── ARCHITECTURE.md
│   └── RESUME.md
└── cursor/
    ├── skills/
    │   ├── figma-dev/SKILL.md       # Design → Code
    │   └── figma-sync/SKILL.md      # Code → Design  ← NEW
    ├── rules/
    │   ├── figma-publish-harness.mdc
    │   └── figma-sync-harness.mdc   ← NEW
    └── prompts/
        ├── figma-publish.md
        └── figma-sync-to-design.md  ← NEW
```

---

## MCP 도구 요약

### 읽기 (Design → Code)

| 도구 | 용도 |
| --- | --- |
| `get_variable_defs` | 디자인 토큰 |
| `get_metadata` | node-id 재귀 수집 |
| `get_design_context` | 퍼블 참고 코드 1회 |
| `get_screenshot` | 시각 레퍼런스 |

### 쓰기 (Code → Figma)

| 도구 | 용도 |
| --- | --- |
| `generate_figma_design` | 웹 페이지 픽셀 캡처 |
| `use_figma` | DS 컴포넌트 조립·수정 |
| `search_design_system` | 컴포넌트·변수 검색 |
| `create_new_file` | 새 Figma 파일 |

---

## 관련 프로젝트

| 저장소 | 설명 |
| --- | --- |
| [3-layer-harness](https://github.com/dayainow/3-layer-harness) | Hooks · 공유 지침 · 전문 에이전트 3계층 하네스 |
| [harness-hub](https://github.com/dayainow/harness-hub) | AI 에이전트 발견·평가·설치 카탈로그 |

---

## License

MIT
