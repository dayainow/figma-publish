# Figma Publish Harness — 종합 가이드

Cursor AI + Figma MCP로 **Figma ↔ Next.js** 양방향 디자인-코드 작업을 팀 단위로 표준화하는 하네스 패키지입니다.

이 문서는 README의 요약을 넘어, **하네스가 무엇인지 · 언제 어떤 방향으로 쓰는지 · 에이전트가 어떤 순서로 MCP를 호출해야 하는지**를 한곳에 정리합니다.

---

## 하네스란?

**하네스(Harness)** 는 AI 에이전트에게 “이 작업은 이렇게 해라”를 고정하는 **3계층 가이드 묶음**입니다.

| 계층 | 역할 | Design → Code | Code → Figma |
| --- | --- | --- | --- |
| **Skill** | 상세 규칙·워크플로우·금지 패턴 | `figma-dev` | `figma-sync` |
| **Rule** | 파일 패턴에 자동 적용되는 짧은 지침 | `figma-publish-harness.mdc` | `figma-sync-harness.mdc` |
| **Prompt** | 채팅에 붙여넣는 시작 템플릿 | `figma-publish.md` | `figma-sync-to-design.md` |

```text
사용자 프롬프트
    ↓
Prompt (시작 문장·체크리스트)
    ↓
Rule (tsx 편집 시 MCP 순서·코드 컨벤션 자동 주입)
    ↓
Skill (node-id 재귀, 병렬 캡처, DS 수집 순서 등 상세 규칙)
    ↓
Cursor Figma 플러그인 내장 스킬 (figma-use, figma-generate-design) — Plugin API 실수 방지
    ↓
Figma MCP 도구 호출
```

`install.sh` 한 번이면 위 Skill · Rule · Prompt가 대상 Next.js 프로젝트의 `.cursor/`에 복사됩니다. 팀원마다 프롬프트를 새로 짜지 않아도 됩니다.

---

## 양방향 워크플로우 한눈에

```text
                    ┌─────────────────────────────────────┐
                    │         Figma Design File           │
                    │  (프레임 · DS 컴포넌트 · 변수)        │
                    └──────────────┬──────────────────────┘
                                   │
           Design → Code (퍼블)     │      Code → Figma (동기화)
           figma-dev               │      figma-sync
                                   │
    get_variable_defs              │      generate_figma_design
    get_metadata (전 깊이 재귀)     │      use_figma (DS 조립)
    get_design_context (1회)       │      search_design_system
                                   │
                    ┌──────────────▼──────────────────────┐
                    │      Next.js App Router + Tailwind   │
                    │  page.tsx · components · figma-assets │
                    └─────────────────────────────────────┘
```

### 방향별 한 줄 정의

| 방향 | 입력 | 출력 | 핵심 도구 |
| --- | --- | --- | --- |
| **Design → Code** | Figma URL + node-id | React + Tailwind TSX | 읽기 MCP 3종 |
| **Code → Figma** | TSX + localhost/배포 URL | 편집 가능한 Figma 화면 | 쓰기 MCP (`generate_figma_design` + `use_figma`) |

두 방향은 **독립**이 아니라 **루프**입니다. 퍼블 → Figma 공유 → 디자이너 수정 → 역퍼블 → 코드 변경 → Figma sync 순으로 반복할 수 있습니다.

---

## Design → Code (Figma → Next.js 퍼블)

상세: [WORKFLOW.md](./WORKFLOW.md)

### 표준 MCP 호출 순서

```text
1. get_variable_defs     색·타이포·spacing → Tailwind 토큰 매핑
2. get_metadata          루트 node-id부터 children 전 깊이 재귀 수집
3. get_design_context    수집한 node-id 범위로 1회만 호출
4. (선택) get_screenshot 단순 UI·레이아웃 확인만 필요할 때
```

### 왜 `get_metadata` 재귀가 필수인가

루트 프레임 node-id **하나만** 넘기면 Hero 본문은 나와도 **CTA · Footer · 배너** 같은 자식이 `get_design_context` 범위에서 빠지는 경우가 많습니다.

```text
❌ 잘못된 예
get_design_context(node-id: "123:456")  // 루트만

✅ 올바른 예
get_metadata("123:456")
  → children을 모든 깊이까지 순회
  → descendant node-id 전부 수집
get_design_context([루트 + 모든 자식 id])
```

### 토큰 절약 원칙

- 화면 전체는 `get_design_context` **1회** — 섹션별 재호출은 불일치 구간만
- 레이아웃 확인만 필요하면 `get_metadata` 우선
- 이미 작성한 코드·토큰 맵이 있으면 MCP 재호출 대신 로컬 파일 우선
- Figma MCP asset URL은 **7일 한도** → `public/images/<도메인>/` + `figma-assets.ts` 로컬 저장 필수

### 코드 품질 게이트 (완료 전)

- [ ] Figma 추출 코드 그대로 붙이지 않고 프로젝트 패턴으로 리팩터
- [ ] button / card / input 등 공통 컴포넌트 분리
- [ ] 동일 텍스트 스타일은 부모 `className` 한 번 (자식 반복 금지)
- [ ] `md:` / `lg:` 반응형, hover · focus-visible · disabled
- [ ] `npm run lint` 통과

---

## Code → Figma (Next.js → Figma 동기화)

상세: [CODE_TO_FIGMA.md](./CODE_TO_FIGMA.md)

### 표준 MCP 호출 순서 (웹앱 · 첫 import)

```text
0. fileKey 확보 (없으면 create_new_file)
1. 코드 읽기 — 섹션·컴포넌트·폰트·이미지 여부 파악
2. 병렬 실행:
   a. generate_figma_design(fileKey) → localhost 캡처 → captureId 폴링
   b. Code Connect → 기존 INSTANCE → search_design_system → use_figma 조립
3. 캡처 레이아웃 기준으로 use_figma 출력 정교화
4. 이미지: 캡처 노드 imageHash → use_figma 대상 fill 복사
5. 검증 후 캡처 레퍼런스 레이어 삭제
```

### 왜 병렬 2트랙인가

| 트랙 | 장점 | 한계 |
| --- | --- | --- |
| `generate_figma_design` | 픽셀 정확한 레이아웃·간격·**이미지 래스터화** | DS 컴포넌트 INSTANCE 아님 (raw frame) |
| `use_figma` | DS 연결·편집·업데이트 용이 | 외부 이미지 URL 직접 삽입 불가 |

**이미지가 있는 웹앱**이면 병렬 캡처가 **필수**입니다. `use_figma` Plugin API는 URL에서 이미지를 가져올 수 없고, 캡처에 들어간 `imageHash`를 복사해야 Hero 일러스트 등이 blank가 되지 않습니다.

### DS 수집 순서 (하드 게이트)

`search_design_system`은 **마지막 수단**입니다. 아래를 먼저 시도합니다.

```text
1. Code Connect (*.figma.ts, *.figma.tsx) → Figma component URL → key
2. 대상 Figma 파일 기존 화면 INSTANCE walk → key 추출
3. get_libraries → search_design_system (미해결분만)
```

### 시나리오별 도구 선택

| 상황 | 권장 |
| --- | --- |
| 웹앱 첫 캡처 + 이미지 있음 | `generate_figma_design` + `use_figma` **병렬** |
| 웹앱 첫 캡처 + 이미지 없음 | `use_figma` 우선, 필요 시 캡처로 검증 |
| 이미 Figma에 화면 있음, 코드만 변경 | `use_figma`만 (재캡처 최소화) |
| 스크린샷 아카이브만 | `generate_figma_design`만 |
| iOS / SwiftUI | `use_figma` + figma-swiftui (웹 캡처 불가) |

### 금지 패턴

- 이미지 있는 웹앱에서 `use_figma`만 단독 사용 → imageHash 없어 이미지 blank
- `search_design_system`을 Code Connect·기존 화면 확인 **전에** 호출
- 거대한 `use_figma` 스크립트 한 방 — **섹션별 작은 호출**로 분할
- 캡처 레퍼런스 레이어를 최종 산출물에 남김

---

## 양방향 검증 루프

퍼블 또는 sync 후 **드리프트**를 줄이려면 같은 node-id 기준으로 양방향 검증합니다.

```text
[Design → Code 완료 후]
Figma node-id 트리  vs  구현 TSX
→ get_metadata로 구조 비교
→ 불일치 섹션만 get_design_context 추가 호출

[Code → Figma 완료 후]
localhost 스크린  vs  Figma 프레임
→ get_screenshot 또는 get_metadata
→ spacing·텍스트·이미지 placeholder 확인
```

데모 앱 `prompts/TRY-ME.md` **시나리오 D**가 이 검증 루프 연습용입니다.

---

## Cursor Figma 플러그인과의 관계

이 하네스는 Cursor **`/add-plugin figma`** 로 설치하는 공식 Figma 플러그인과 함께 씁니다.

| 구분 | figma-publish 하네스 | Cursor Figma 플러그인 |
| --- | --- | --- |
| 역할 | **팀·프로젝트별** 워크플로우·품질 게이트 | MCP 서버 + Plugin API 실행 환경 |
| 예시 | node-id 재귀, 병렬 캡처 순서 | `use_figma`, `generate_figma_design` 도구 |
| 내장 스킬 | `figma-dev`, `figma-sync` | `figma-use`, `figma-generate-design` 등 |

Code → Figma 작업 시 **`figma-sync` + `figma-use` + `figma-generate-design`** 스킬을 함께 로드하는 것이 권장됩니다. `use_figma` 호출 전 `figma-use`를 건너뛰면 font load 누락·auto-layout 오류 등 디버깅이 어려운 실패가 잦습니다.

---

## MCP 연결 · 요금제 주의

상세: [MCP_SETUP.md](./MCP_SETUP.md)

| 서버 | URL | 용도 |
| --- | --- | --- |
| Figma Remote (권장) | `https://mcp.figma.com/mcp` | 읽기 + 쓰기, OAuth Connect |
| Figma Desktop | `http://127.0.0.1:3845/mcp` | 데스크톱 앱 연동 (읽기 위주) |
| Figma Context MCP | `figma-developer-mcp` + PAT | 읽기·에셋 (`FIGMA_API_KEY`) |

### 호출 한도 (2025 기준)

Starter 플랜 **View / Collab 시트**는 MCP **월 6회** 수준으로 제한될 수 있습니다. `use_figma`·`get_metadata` 등 대부분의 읽기/쓰기 도구가 여기에 해당합니다.

일부 도구는 한도 예외로 문서화되어 있습니다 (`whoami`, `generate_figma_design` 등). **캡처만 성공하고 DS 조립이 막히는** 경우, 시트를 Dev/Full로 올리거나 상위 플랜을 검토하세요.

```text
증상: "rate limit" / "Starter plan" 메시지
원인: View 시트 월간 MCP 한도 소진
대응: ① Dev/Full 시트 업그레이드  ② 한도 리셋 후 use_figma 단계 재실행
```

---

## 설치 · 프로젝트에 붙이기

```bash
git clone https://github.com/dayainow/figma-publish.git
/path/to/figma-publish/install.sh /path/to/your-nextjs-project
```

복사되는 항목:

```text
your-project/.cursor/
├── skills/figma-dev/SKILL.md
├── skills/figma-sync/SKILL.md
├── rules/figma-publish-harness.mdc
├── rules/figma-sync-harness.mdc
├── prompts/figma-publish.md
├── prompts/figma-sync-to-design.md
└── mcp.json          # 없을 때만 생성
```

이후 Cursor 재시작 → `/add-plugin figma` → MCP Connect.

---

## 예제 앱으로 30분 연습

```bash
cd examples/demo-app
chmod +x setup.sh && ./setup.sh
npm run dev    # http://localhost:3456
```

| 시나리오 | 방향 | 연습 포인트 |
| --- | --- | --- |
| **A** | Code → Figma | `generate_figma_design` + `use_figma` 병렬, Hero 이미지 |
| **B** | Design → Code | `get_metadata` 재귀, `get_design_context` 1회 |
| **C** | Code → Figma (섹션) | Hero만 `use_figma` 조립 |
| **D** | 검증 | Figma vs 코드 드리프트 점검 |

프롬프트 전문: `examples/demo-app/prompts/TRY-ME.md`

### 데모 페이지 구성 (node-id 연습용)

```text
┌─────────────────────────────────────┐
│ SiteHeader        nav 2링크          │
├─────────────────────────────────────┤
│ HeroSection       badge·h1·2버튼     │
│                   hero SVG 이미지 ←  │
├─────────────────────────────────────┤
│ FeatureGrid       카드 3개            │
├─────────────────────────────────────┤
│ CtaBanner         gradient + button  │
├─────────────────────────────────────┤
│ SiteFooter                           │
└─────────────────────────────────────┘
```

---

## 프롬프트 빠른 참조

### Design → Code

```text
이 Figma 프레임을 Next.js App Router + Tailwind로 구현해줘.
Figma: <URL>
1. get_variable_defs → 2. get_metadata (재귀) → 3. get_design_context 1회
```

### Code → Figma

```text
이 Next.js 페이지를 Figma로 옮겨줘.
소스: src/app/.../page.tsx  URL: http://localhost:3000/...
Figma: <URL>
병렬: generate_figma_design 캡처 + use_figma DS 조립 → 캡처 레이어 삭제
```

전체 템플릿: `cursor/prompts/` 또는 설치 후 `.cursor/prompts/`

---

## 문서 맵

| 문서 | 내용 |
| --- | --- |
| [README.md](../README.md) | 개요 · Quick Start |
| **이 문서** | 하네스 종합 · 양방향 루프 |
| [WORKFLOW.md](./WORKFLOW.md) | Design → Code 상세 |
| [CODE_TO_FIGMA.md](./CODE_TO_FIGMA.md) | Code → Figma 상세 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 3계층 · MCP 아키텍처 |
| [MCP_SETUP.md](./MCP_SETUP.md) | MCP 연결 · PAT |
| [examples/README.md](../examples/README.md) | 데모 앱 안내 |

---

## 관련 프로젝트

| 저장소 | 관계 |
| --- | --- |
| [3-layer-harness](https://github.com/dayainow/3-layer-harness) | Skill · Rule · Prompt 3계층 패턴 원형 |
| [harness-hub](https://github.com/dayainow/harness-hub) | 하네스 카탈로그 |
