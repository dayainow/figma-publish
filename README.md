<div align="center">

# Figma Publish Harness

**Cursor AI + Figma MCP**로 Figma 디자인을 **Next.js + Tailwind** 코드로 옮기는 퍼블리싱 워크플로우를 표준화한 하네스 패키지입니다.

[![Cursor](https://img.shields.io/badge/Cursor-AI%20IDE-000000?style=flat-square)](https://cursor.com/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-6366F1?style=flat-square)](https://modelcontextprotocol.io/)
[![Figma](https://img.shields.io/badge/Figma-MCP%20연동-F24E1E?style=flat-square&logo=figma&logoColor=white)](https://www.figma.com/)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[워크플로우](./docs/WORKFLOW.md) · [MCP 설정](./docs/MCP_SETUP.md) · [이력서 요약](./docs/RESUME.md) · [아키텍처](./docs/ARCHITECTURE.md)

</div>

---

## 왜 필요한가

AI 에이전트로 Figma → 코드 변환을 할 때, **담당자·프롬프트·MCP 호출 방식**이 제각각이면 품질 편차·UI 누락·토큰 낭비가 반복됩니다.

이 하네스는 다음을 **Skill / Rule / Prompt** 3계층으로 고정합니다.

| Pain Point | 해결 |
| --- | --- |
| Figma → 코드 변환 품질 편차 | Skills / Rules / Prompts로 **워크플로우 표준화** |
| 루트 node-id만 조회 시 CTA·푸터 등 누락 | `get_metadata` **전 깊이 재귀 수집** 규칙 |
| MCP 과다 호출 → 토큰·비용·시간 낭비 | 도구별 사용 기준 + **1회 호출 원칙** |
| Figma 임시 에셋 URL(7일 만료) 의존 | 도메인별 로컬 저장 + 상수 파일 관리 |
| 신규 팀원 온보딩 비용 | `install.sh` 한 번으로 `.cursor/` 셋업 |

---

## Quick Start

### 1. 설치

대상 Next.js 프로젝트 루트에서:

```bash
git clone https://github.com/dayainow/figma-publish.git /tmp/figma-publish
/tmp/figma-publish/install.sh .
```

또는 monorepo의 `harness/figma-publish/`에 두었다면:

```bash
./harness/figma-publish/install.sh
```

### 2. MCP 연결 (5분)

1. Cursor → `/add-plugin figma` → **Settings → Tools & MCP → figma → Connect**
2. [Figma Personal Access Token](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens) 발급 후 `FIGMA_API_KEY` 환경 변수 등록
3. Cursor 재시작 → MCP 목록에서 `figma`, `figmaContextMcp` 연결 확인

상세: [docs/MCP_SETUP.md](./docs/MCP_SETUP.md)

### 3. 퍼블 요청

`cursor/prompts/figma-publish.md`를 채팅에 붙여넣거나:

```text
이 Figma 프레임을 Next.js App Router + Tailwind로 구현해줘.

Figma: <URL>
섹션: <Hero | …>

1. get_variable_defs → 토큰
2. get_metadata → 자식 node-id 재귀 수집
3. get_design_context 1회

- 공통 컴포넌트 우선, 동일 스타일은 부모 className 한 번
- md/lg 반응형, 접근성, 이미지는 public/images/<도메인>/ + figma-assets.ts
```

---

## 표준 파이프라인

```text
Figma 프레임 URL + 섹션명
    ↓
get_variable_defs  → Tailwind 디자인 토큰 매핑
    ↓
get_metadata       → 루트부터 children 전 깊이 node-id 재귀 수집
    ↓
get_design_context → 수집 범위 기준 1회 호출 (불일치 구간만 재호출)
    ↓
코드 작성 + 후처리 체크리스트 (린트·접근성·에셋)
```

| 목적 | MCP 도구 | 사용 시점 |
| --- | --- | --- |
| 색·타이포·spacing 토큰 | `get_variable_defs` | Tailwind 매핑 |
| 레이아웃·node 트리 | `get_metadata` | node-id 수집·1차 검증 |
| 구조·스타일 참고 코드 | `get_design_context` | 화면 퍼블 1회 |
| 시각 레퍼런스 | `get_screenshot` | 단순 UI, 토큰 절약 |
| 컴포넌트 매핑 | `get_code_connect_map` | 초기 세팅 1회 |

---

## 패키지 구조

```text
figma-publish/
├── README.md
├── install.sh                         # .cursor/ 자동 복사
├── mcp.project.json.example           # MCP 서버 설정 템플릿
├── docs/
│   ├── WORKFLOW.md                    # 상세 워크플로우
│   ├── MCP_SETUP.md                   # MCP 3종 연동 가이드
│   ├── ARCHITECTURE.md                # 3계층 AI 가이드 구조
│   └── RESUME.md                      # 이력서·포트폴리오용 요약
└── cursor/
    ├── skills/figma-dev/SKILL.md      # node-id 재귀·토큰·에셋 규칙
    ├── rules/figma-publish-harness.mdc # TSX 작업 시 자동 적용 규칙
    └── prompts/figma-publish.md       # 채팅 붙여넣기용 프롬프트
```

### 3계층 AI 가이드

| 계층 | 역할 | 파일 |
| --- | --- | --- |
| **Skill** | Figma 퍼블 전문 지식 (node-id 재귀, 토큰 절약, 에셋 경로) | `cursor/skills/figma-dev/SKILL.md` |
| **Rule** | `src/**/*.tsx` 작업 시 MCP 호출 순서·코드 컨벤션 강제 | `cursor/rules/figma-publish-harness.mdc` |
| **Prompt** | 섹션 퍼블 / 디자인 검증용 즉시 사용 템플릿 | `cursor/prompts/figma-publish.md` |

---

## 후처리 체크리스트

- [ ] `get_variable_defs` 반영 — 임의 hex/px 최소화
- [ ] 공통 컴포넌트(button, card, input) 재사용
- [ ] 부모에 공통 `text-*` 한 번만 (자식 반복 금지)
- [ ] `interface XxxProps`, Named export
- [ ] hover / focus-visible / disabled
- [ ] 이미지: `public/images/<도메인>/` + `src/constants/figma-assets.ts`
- [ ] `yarn lint` 통과

---

## 기술 스택

- **AI IDE**: Cursor (Agent, Skills, Rules, Prompts)
- **MCP**: Figma Remote · Figma Desktop · Figma Context (`figma-developer-mcp`)
- **프론트엔드**: Next.js App Router, React, Tailwind CSS
- **디자인 연동**: Figma node-id, design tokens, Code Connect
- **자동화**: Bash install script, MCP 프로젝트 설정 템플릿

---

## 관련 프로젝트

| 저장소 | 설명 |
| --- | --- |
| [3-layer-harness](https://github.com/dayainow/3-layer-harness) | Hooks · 공유 지침 · 전문 에이전트 3계층 하네스 템플릿 |
| [harness-hub](https://github.com/dayainow/harness-hub) | AI 에이전트 발견·평가·설치 카탈로그 플랫폼 |

---

## License

MIT — 자유롭게 복사·수정·재배포 가능합니다.
