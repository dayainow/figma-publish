<div align="center">

# Figma Publish Harness

**Cursor AI + Figma MCP**로 Figma ↔ Next.js **양방향** 디자인-코드 워크플로우를 표준화한 하네스 패키지입니다.

[![Cursor](https://img.shields.io/badge/Cursor-AI%20IDE-000000?style=flat-square)](https://cursor.com/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-6366F1?style=flat-square)](https://modelcontextprotocol.io/)
[![Figma](https://img.shields.io/badge/Figma-MCP%20연동-F24E1E?style=flat-square&logo=figma&logoColor=white)](https://www.figma.com/)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[종합 가이드](./docs/HARNESS_GUIDE.md) · [Design → Code](./docs/WORKFLOW.md) · [Code → Figma](./docs/CODE_TO_FIGMA.md) · [MCP 설정](./docs/MCP_SETUP.md) · [아키텍처](./docs/ARCHITECTURE.md) · [이력서](./docs/RESUME.md)

</div>

---

## 양방향 워크플로우

이 하네스의 핵심은 **Figma와 Next.js 코드 사이를 양방향으로 오가는 루프**를 Skill · Rule · Prompt로 고정하는 것입니다.  
전체 설명: **[docs/HARNESS_GUIDE.md](./docs/HARNESS_GUIDE.md)**

```text
                    ┌─────────────────────────────────────┐
                    │         Figma Design File           │
                    └──────────────┬──────────────────────┘
                                   │
           Design → Code           │           Code → Figma
           (figma-dev)             │           (figma-sync)
                                   │
    ① get_variable_defs            │    ① create_new_file (fileKey 없을 때)
    ② get_metadata (전 깊이 재귀)   │    ② 코드에서 섹션·이미지 파악
    ③ get_design_context (1회)     │    ③ 병렬:
    ④ Next.js + Tailwind 작성       │       a. generate_figma_design (픽셀 캡처)
                                   │       b. use_figma (DS 컴포넌트 조립)
                                   │    ④ imageHash 이전 · 레이아웃 정교화
                                   │    ⑤ 캡처 레퍼런스 레이어 삭제
                    ┌──────────────▼──────────────────────┐
                    │      Next.js App Router + Tailwind   │
                    └─────────────────────────────────────┘
```

| 방향 | 언제 | Skill | Prompt | 상세 문서 |
| --- | --- | --- | --- | --- |
| **Figma → Code** | 디자인을 퍼블할 때 | `figma-dev` | `figma-publish.md` | [WORKFLOW.md](./docs/WORKFLOW.md) |
| **Code → Figma** | 구현 결과를 디자인 파일로 공유·동기화할 때 | `figma-sync` | `figma-sync-to-design.md` | [CODE_TO_FIGMA.md](./docs/CODE_TO_FIGMA.md) |
| **양방향 검증** | 퍼블/sync 후 드리프트 점검 | 둘 다 | TRY-ME 시나리오 D | [HARNESS_GUIDE.md](./docs/HARNESS_GUIDE.md) |

### 3계층 하네스

| 계층 | 역할 | 예시 |
| --- | --- | --- |
| **Skill** | MCP 호출 순서·금지 패턴·상세 절차 | node-id 재귀, 병렬 캡처, DS 수집 순서 |
| **Rule** | `src/**/*.tsx` 편집 시 자동 주입 | 퍼블 MCP 순서, className 중복 금지 |
| **Prompt** | 채팅 시작 템플릿 | 섹션 퍼블, 페이지 sync, 검증 |

`install.sh` → 대상 프로젝트 `.cursor/`에 위 3계층 + `mcp.json` 템플릿 복사.

### Design → Code 핵심 규칙 (요약)

- 루트 node-id만으로 `get_design_context` 호출 **금지** → `get_metadata`로 **전 깊이 재귀** 후 1회 호출
- CTA · Footer · 배너 누락 방지
- Figma asset URL 7일 한도 → `public/images/<도메인>/` + `figma-assets.ts` 로컬 저장

### Code → Figma 핵심 규칙 (요약)

- 웹앱 + **이미지 포함** 첫 import → `generate_figma_design` + `use_figma` **병렬 필수**
- `use_figma`만 쓰면 이미지 blank — 캡처의 `imageHash`를 복사해야 함
- `search_design_system`은 Code Connect · 기존 INSTANCE 확인 **후** 마지막에
- 이미 Figma에 있는 화면 업데이트 → `use_figma`만 (재캡처 최소화)

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
│   ├── HARNESS_GUIDE.md         # 하네스 종합 · 양방향 루프  ← NEW
│   ├── WORKFLOW.md              # Design → Code
│   ├── CODE_TO_FIGMA.md         # Code → Design
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
