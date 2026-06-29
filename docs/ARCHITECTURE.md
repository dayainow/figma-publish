# 아키텍처 — 3계층 AI 가이드 구조

Figma Publish Harness는 Cursor의 **Skill · Rule · Prompt** 3계층으로 AI 에이전트 행동을 고정합니다.

```text
┌─────────────────────────────────────────────────────────┐
│  Prompt (즉시 사용 템플릿)                                │
│  cursor/prompts/figma-publish.md                        │
│  → 채팅에 붙여넣기, 섹션 퍼블·검증 요청                    │
├─────────────────────────────────────────────────────────┤
│  Rule (파일 패턴 자동 적용)                               │
│  cursor/rules/figma-publish-harness.mdc                   │
│  → src/**/*.tsx 작업 시 MCP 순서·코드 컨벤션 강제          │
├─────────────────────────────────────────────────────────┤
│  Skill (전문 지식·워크플로우)                             │
│  cursor/skills/figma-dev/SKILL.md                         │
│  → node-id 재귀, 토큰 절약, 에셋 경로, 체크리스트           │
└─────────────────────────────────────────────────────────┘
```

---

## 각 계층의 역할

### Layer 1: Skill — "어떻게 Figma 퍼블을 하는가"

- **트리거**: "피그마", "figma", "퍼블", "node-id", "get_design_context" 등
- **내용**: node-id 재귀 3단계, MCP 도구별 사용 기준, 토큰 절약 원칙, 에셋 저장 규칙
- **특징**: 에이전트가 Figma 관련 작업을 **인식하면 자동 참조**

### Layer 2: Rule — "TSX 파일 작업 시 무엇을 지켜야 하는가"

- **적용 범위**: `src/**/*.tsx` (globs)
- **내용**: MCP 호출 순서, Next.js + Tailwind 컨벤션, 공통 컴포넌트 우선, className 중복 금지
- **특징**: 파일 패턴 매칭으로 **작업 중 자동 적용**

### Layer 3: Prompt — "지금 이 섹션을 퍼블해줘"

- **용도**: 채팅에 붙여넣는 즉시 사용 템플릿
- **내용**: Figma URL, 섹션명, MCP 3단계, 후처리 요구사항
- **특징**: 매번 같은 프롬프트 구조로 **일관된 요청**

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
│ MCP (OAuth)    │ │ MCP (로컬)      │ │ (REST API + PAT)   │
└───────┬────────┘ └───────┬────────┘ └─────────┬──────────┘
        │                  │                    │
        └──────────────────┼────────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  Figma Design   │
                  │  File + Tokens  │
                  └────────┬────────┘
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
    ├── rules/figma-publish-harness.mdc
    ├── prompts/figma-publish.md
    └── mcp.json (없을 때만 생성)
```

- 하네스 소스는 **별도 저장소** 또는 monorepo의 `harness/figma-publish/`에 유지
- 대상 프로젝트에는 `install.sh`로 `.cursor/`만 복사
- `.cursor/mcp.json`은 gitignore → 팀원 로컬 셋업

---

## 품질 게이트

AI 출력 후 사람·린터가 검증하는 체크포인트:

1. **토큰 매핑** — `get_variable_defs` 반영, 임의 hex/px 최소화
2. **컴포넌트 분리** — button, card, input 등 공통 컴포넌트 재사용
3. **스타일 중복 제거** — 부모 className 한 번
4. **접근성** — hover, focus-visible, disabled
5. **에셋 영속성** — 로컬 저장 + 상수 등록 (7일 URL 만료 대비)
6. **린트** — `yarn lint` 통과

---

## 확장 포인트

| 확장 | 방법 |
| --- | --- |
| 다른 프레임워크 (Vue, Svelte) | Rule의 globs·스택 설명 수정 |
| 디자인 시스템 연동 | Code Connect + `get_code_connect_map` |
| CI 품질 게이트 | lint + a11y 테스트를 PR 체크에 추가 |
| 팀 온보딩 | `install.sh` + [MCP_SETUP.md](./MCP_SETUP.md) 문서 공유 |
