# 워크플로우 가이드

Figma 디자인을 Next.js + Tailwind 코드로 옮길 때 AI 에이전트가 따라야 하는 **표준 파이프라인**입니다.

**하네스 전체 개요 · 양방향 루프**: [HARNESS_GUIDE.md](./HARNESS_GUIDE.md) · 역방향(Code → Figma): [CODE_TO_FIGMA.md](./CODE_TO_FIGMA.md)

---

## 전체 흐름

```text
Figma 프레임 URL + 섹션명
    ↓
get_variable_defs  → Tailwind 디자인 토큰 매핑
    ↓
get_metadata       → 루트부터 children 전 깊이 node-id 재귀 수집
    ↓
get_design_context → 수집 범위 기준 1회 호출 (불일치 구간만 재호출)
    ↓
코드 작성 + 후처리 체크리스트
```

---

## MCP 도구별 역할

| 목적 | 도구 | 사용 시점 | 토큰 절약 팁 |
| --- | --- | --- | --- |
| 색·타이포·spacing 토큰 | `get_variable_defs` | Tailwind 매핑 시 | 전체 프레임 대신 변수 정의만 조회 |
| 레이아웃·node 트리 | `get_metadata` | node-id 수집, 검증 1차 | 스타일·텍스트 불필요 시 이 도구 우선 |
| 구조·스타일 참고 코드 | `get_design_context` | 화면 퍼블 1회 | `forceCode`는 꼭 필요할 때만. 재호출 최소화 |
| 시각 레퍼런스 | `get_screenshot` | 단순 UI | LLM 맥락 없이 이미지만 수신 |
| 컴포넌트 매핑 | `get_code_connect_map` | 초기 세팅 1회 | 맵핑 후 재사용, 재호출 불필요 |

---

## 규칙 1: node-id 전 깊이 재귀 수집 (필수)

루트 node-id 1개만으로는 **자식 요소(CTA, 푸터, 배너 등)의 상세 정보가 누락**됩니다.

### 절차

**1) 자식 node-id 전부 수집**

```text
get_metadata(node-id: "<루트 node-id>")
  → 응답의 children을 모든 깊이까지 재귀 순회
  → descendant node-id를 빠짐없이 수집
```

**2) 수집한 범위로 컨텍스트 요청**

```text
get_design_context(node-ids: [루트 + 모든 자식 node-id])
  → 자식 요소까지 레이아웃·텍스트·스타일이 요청 범위에 포함되도록
```

**3) 검증 시에도 동일 절차**

구현 ↔ 디자인 비교가 필요할 때도 1)~2)를 재실행해 누락/불일치를 점검합니다.

---

## 규칙 2: 토큰 최적화 원칙

- **"전체 프레임 한 번, 섹션 단위는 정말 필요한 경우에만"** `get_design_context` 사용
- 이미 만든 코드·토큰 정보가 있으면 **재호출 대신 로컬 자료 우선**
- 단순 카드/배너는 `get_screenshot`만 받고 Tailwind 직접 작성
- 레이아웃 확인만 필요하면 `get_metadata` 우선

---

## 퍼블 1차 (화면을 "그릴 때")

```text
1. Figma에서 프레임 루트 node-id 확인
2. get_metadata → children 재귀 수집
3. 수집한 node-id 범위로 get_design_context 1회 호출
4. 구조/스타일 참고해 React + Tailwind 코드 작성
5. 이후 수정은 로컬 코드에서만 진행 (재호출 최소화)
6. 세부 색/폰트가 애매하면 get_variable_defs로 추가 조회
```

---

## 검증 (구현 ↔ 디자인 비교)

```text
1. get_metadata로 노드 트리·레이아웃 정보 먼저 확인
2. 레이아웃 불일치 시 → 해당 섹션 node-id만 좁혀 get_design_context 추가 호출
3. 텍스트/토큰 차이 의심 → get_variable_defs로 디자인 토큰만 비교
```

---

## 코드·품질 규칙 (AI 출력 후처리)

- Figma 추출 코드를 그대로 붙이지 않고 **프로젝트 패턴으로 리팩터**
- 공통 컴포넌트(button, card, input) 우선 재사용
- 동일 텍스트 스타일은 **부모 `className` 한 번** — 자식 반복 금지
- 반응형: 데스크톱 프레임 + `md:` / `lg:` breakpoint
- 접근성: hover, focus-visible, disabled 상태
- 이미지: `public/images/<도메인>/` + `figma-assets.ts` 상수 등록
- 완료 전 `yarn lint` 통과

---

## 이미지 에셋 관리

Figma MCP asset URL은 **7일 한도**이므로 로컬 저장이 필수입니다.

| 도메인 | 저장 경로 |
| --- | --- |
| `/` · `/home` | `public/images/home/` |
| `/search` | `public/images/search/` |
| Figma 에셋 (공통) | `public/images/figma/` |
| 그 외 | `public/images/<도메인명>/` |

- 파일명: Figma node-id 기반 또는 `[도메인]-[블록명].ext`
- `src/constants/figma-assets.ts`에 경로 상수 등록
- 코드에서 `/images/<도메인>/파일명` 형태로 참조

---

## 프롬프트 템플릿

### 섹션 퍼블

```text
이 Figma 프레임을 Next.js App Router + Tailwind로 구현해줘.

Figma: <URL>
섹션: <Hero | …>
node-id: <있으면>

1. get_variable_defs → 토큰
2. get_metadata → 자식 node-id 재귀 수집
3. get_design_context 1회

- 공통 컴포넌트 우선, button/card/input 분리
- 동일 스타일은 부모 className 한 번
- md/lg 반응형, 접근성 포함
- 이미지: public/images/<도메인>/ + figma-assets.ts
```

### 디자인 검증

```text
Figma vs 구현 검증.
파일: <구현 파일 경로>
Figma: <URL> node-id: <id>
get_metadata 후 불일치 구간만 get_design_context.
```
