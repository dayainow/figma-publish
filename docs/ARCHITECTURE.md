# 아키텍처 — 양방향 3계층 AI 가이드

Figma Publish Harness는 Cursor **Skill · Rule · Prompt** 3계층으로 **Design ↔ Code** 양방향 워크플로우를 고정합니다.

**종합 가이드(하네스 개요·양방향 루프·연습 순서)**: [HARNESS_GUIDE.md](./HARNESS_GUIDE.md)

---

## 양방향 구조

```text
┌──────────────────────────────────────────────────────────────────┐
│                         Cursor Agent                              │
├─────────────────────────────┬────────────────────────────────────┤
│   Design → Code (퍼블)       │   Code → Design (동기화)            │
├─────────────────────────────┼────────────────────────────────────┤
│ Prompt: figma-publish.md    │ Prompt: figma-sync-to-design.md    │
│ Rule:  figma-publish-harness│ Rule:  figma-sync-harness          │
│ Skill: figma-dev            │ Skill: figma-sync                  │
├─────────────────────────────┼────────────────────────────────────┤
│ get_variable_defs           │ generate_figma_design                │
│ get_metadata                │ use_figma                            │
│ get_design_context          │ search_design_system               │
└─────────────────────────────┴────────────────────────────────────┘
                              │
                              ▼
                    Figma Design File
                              │
                              ▼
                    Next.js + Tailwind
```

---

## Design → Code (figma-dev)

| 계층 | 파일 | 역할 |
| --- | --- | --- |
| **Skill** | `cursor/skills/figma-dev/SKILL.md` | node-id 재귀, 토큰 절약, 에셋 경로 |
| **Rule** | `cursor/rules/figma-publish-harness.mdc` | `src/**/*.tsx` MCP 순서·코드 컨벤션 |
| **Prompt** | `cursor/prompts/figma-publish.md` | 섹션 퍼블·검증 템플릿 |

---

## Code → Figma (figma-sync)

| 계층 | 파일 | 역할 |
| --- | --- | --- |
| **Skill** | `cursor/skills/figma-sync/SKILL.md` | 병렬 캡처, DS 수집 순서, use_figma 원칙 |
| **Rule** | `cursor/rules/figma-sync-harness.mdc` | 쓰기 MCP 순서, 금지 패턴 |
| **Prompt** | `cursor/prompts/figma-sync-to-design.md` | 페이지/섹션/sync 템플릿 |

Cursor Figma 플러그인 내장 **`figma-use`**, **`figma-generate-design`** 스킬과 함께 쓰면 Plugin API 실수를 줄일 수 있습니다.

---

## MCP 연동 아키텍처

```text
                    ┌──────────────────┐
                    │   Cursor Agent   │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────────┐
│ Figma Remote   │ │ Figma Desktop  │ │ Figma Context MCP  │
│ (읽기+쓰기)     │ │ (읽기+쓰기)     │ │ (읽기·에셋)         │
└───────┬────────┘ └───────┬────────┘ └─────────┬──────────┘
        │                  │                    │
        └──────────────────┼────────────────────┘
                           ▼
                  ┌─────────────────┐
         ◄────────│  Figma Design   │────────►
    get_design_   │  File + DS      │  use_figma +
    context       └────────┬────────┘  generate_figma_design
                           │
                           ▼
                  ┌─────────────────┐
                  │ Next.js +       │
                  │ Tailwind Code   │
                  └─────────────────┘
```

---

## 설치·배포 모델

```text
figma-publish/ (이 저장소)
    │
    │  install.sh
    ▼
target-project/.cursor/
    ├── skills/figma-dev/SKILL.md
    ├── skills/figma-sync/SKILL.md
    ├── rules/figma-publish-harness.mdc
    ├── rules/figma-sync-harness.mdc
    ├── prompts/figma-publish.md
    ├── prompts/figma-sync-to-design.md
    └── mcp.json (없을 때만 생성)
```

---

## 품질 게이트

### Design → Code

1. 토큰 매핑 · 2. 컴포넌트 분리 · 3. className 중복 제거 · 4. 접근성 · 5. 에셋 로컬 저장 · 6. lint

### Code → Figma

1. DS INSTANCE 사용 · 2. 변수·스타일 바인딩 · 3. 제품 폰트 · 4. imageHash 이전 · 5. 캡처 레이어 삭제 · 6. auto-layout

---

## 확장 포인트

| 확장 | 방법 |
| --- | --- |
| SwiftUI ↔ Figma | Cursor `figma-swiftui` 스킬 |
| Code Connect | `get_code_connect_map` + `*.figma.tsx` |
| CI 품질 게이트 | lint + visual regression |
| 팀 온보딩 | `install.sh` + [MCP_SETUP.md](./MCP_SETUP.md) |
