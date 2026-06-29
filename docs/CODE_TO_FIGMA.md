# Code → Figma 워크플로우

퍼블 완료된 **Next.js + Tailwind** 화면을 Figma 디자인 파일로 되돌리는 **역방향(code-to-design)** 파이프라인입니다.

Design → Code는 [WORKFLOW.md](./WORKFLOW.md), 이 문서는 **Code → Design**을 다룹니다.

---

## 언제 쓰는가

| 상황 | 예시 |
| --- | --- |
| 퍼블 결과를 디자이너에게 공유 | "구현된 Hero를 Figma로 올려줘" |
| 디자인-코드 드리프트 동기화 | "코드랑 Figma 화면 맞춰줘" |
| DS 컴포넌트 인스턴스로 화면 재구성 | Code Connect 매핑된 Button/Card 재사용 |
| QA·리뷰용 스크린 아카이브 | 배포 URL 또는 localhost 캡처 |

**트리거 키워드**: write to Figma, push page to Figma, Figma로 옮겨, 코드를 Figma에, Figma 동기화

---

## 핵심 MCP 도구 (쓰기)

| 도구 | 역할 | 사용 시점 |
| --- | --- | --- |
| **`generate_figma_design`** | 웹 페이지를 Figma에 **픽셀 퍼펙트 캡처** | localhost·배포 URL 첫 캡처 |
| **`use_figma`** | Plugin API로 **노드 생성·수정·동기화** | DS 컴포넌트 조립, 기존 화면 업데이트 |
| **`search_design_system`** | 컴포넌트·변수·스타일 검색 | Code Connect·라이브러리 탐색 |
| **`get_libraries`** | 파일에 연결 가능한 라이브러리 목록 | search 전 범위 좁히기 |
| **`create_new_file`** | 새 Figma 파일 생성 | 대상 fileKey 없을 때 |

> **읽기 전용** 도구(`get_design_context` 등)는 검증·비교 시에만 사용합니다.

---

## 표준 파이프라인 (웹앱 · Next.js)

웹앱은 **병렬 2트랙**이 권장됩니다.

```text
퍼블 완료된 페이지 (소스 코드 + localhost/배포 URL)
    ↓
대상 Figma fileKey 확보 (없으면 create_new_file)
    ↓
┌────────────────────────────┬─────────────────────────────────┐
│ generate_figma_design      │ use_figma + search_design_system │
│ (픽셀 퍼펙트 캡처)          │ (DS 컴포넌트·변수로 화면 조립)     │
└────────────────────────────┴─────────────────────────────────┘
    ↓
use_figma 결과를 캡처 레이아웃에 맞게 정교화
    ↓
이미지 있으면: 캡처의 imageHash → use_figma 출력으로 이전
    ↓
검증 후 generate_figma_design 캡처 레이어 삭제 (레퍼런스용)
    ↓
Figma에 DS 연결된 편집 가능한 화면 완성
```

### 왜 병렬인가

| 트랙 | 장점 | 한계 |
| --- | --- | --- |
| `generate_figma_design` | 레이아웃·간격·이미지 **픽셀 정확** | DS 컴포넌트 인스턴스 아님 |
| `use_figma` | **디자인 시스템 연결**, 편집·업데이트 용이 | 외부 이미지 URL 직접 불가 |

**이미지가 있는 화면**이면 병렬 캡처가 **필수**입니다. `use_figma`는 외부 URL 이미지를 못 넣고, 캡처에서 `imageHash`를 복사해야 합니다.

---

## 단계별 절차

### Step 0: 사전 준비

- [ ] Cursor `/add-plugin figma` + MCP Connect
- [ ] 대상 Figma 파일 URL 또는 `fileKey`
- [ ] 소스: TSX 파일 경로 + 렌더 URL (`http://localhost:3000/...`)
- [ ] dev server 실행 중 (로컬 캡처 시)

### Step 1: 화면 구조 파악 (코드 읽기)

1. 페이지/섹션 TSX 파일 읽기
2. 섹션 단위 분해 (Header, Hero, Content, Footer 등)
3. 사용 컴포넌트 목록 (Button, Card, Input …)
4. **제품 폰트** 확인 — Inter 기본 가정 금지
5. **이미지 포함 여부** 확인 — 있으면 Step 2부터 병렬 캡처 시작

### Step 2: 디자인 시스템 수집 (쓰기 전 필수)

순서를 지킵니다. `search_design_system`은 **마지막 수단**.

| 순서 | 방법 | 설명 |
| --- | --- | --- |
| **2a-i** | Code Connect (`*.figma.ts`, `*.figma.tsx`) | 코드베이스에서 Figma component URL → key 해석 |
| **2a-ii** | 기존 Figma 화면 INSTANCE 스캔 | target 파일에 같은 DS 화면이 있으면 key 추출 |
| **2a-iii** | `get_libraries` → `search_design_system` | 미해결 컴포넌트만 검색 |

변수·텍스트 스타일·이펙트도 함께 수집 — hex/px 하드코딩 최소화.

### Step 3: 병렬 실행 (웹앱)

**동시에:**

1. `generate_figma_design({ fileKey, nodeId? })` — captureId 받은 뒤 5초 간격 폴링 (최대 10회)
2. `use_figma` — 섹션별 DS 컴포넌트 import + auto-layout 조립

Cursor Figma 플러그인의 **`figma-use`**, **`figma-generate-design`** 스킬을 함께 로드하면 API 실수를 줄일 수 있습니다.

### Step 4: 정교화·이미지 이전

1. 캡처와 use_figma 출력 **스크린샷 비교**
2. spacing·font·색 불일치 수정
3. 이미지: 캡처 노드의 `imageHash` → use_figma 대상 fill에 복사
4. 폰트 패밀리가 제품과 일치하는지 확인

### Step 5: 마무리

- [ ] DS 컴포넌트 INSTANCE 사용 (primitive box 남발 금지)
- [ ] 변수·스타일 바인딩 (가능한 경우)
- [ ] 캡처 레퍼런스 레이어 삭제
- [ ] 프레임 이름·페이지 정리

---

## 시나리오별 선택

| 시나리오 | 권장 도구 |
| --- | --- |
| **웹앱 첫 캡처** (이미지 있음) | `generate_figma_design` + `use_figma` 병렬 |
| **웹앱 첫 캡처** (이미지 없음) | `use_figma` 우선, 필요 시 캡처로 검증 |
| **이미 Figma에 있는 화면 업데이트** | `use_figma`만 (코드 변경 반영) |
| **iOS / SwiftUI** | `use_figma` + figma-swiftui 스킬 (웹 캡처 불가) |
| **단순 스크린샷 아카이브만** | `generate_figma_design`만 |

---

## use_figma vs generate_figma_design

```text
기본 원칙: Figma 쓰기 작업은 use_figma가 기본.

예외: 웹앱을 Figma에 "처음" 넣을 때 generate_figma_design 병렬 사용.
이미 캡처된 페이지를 코드 변경에 맞춰 sync할 때는 use_figma만.
```

---

## 후처리 체크리스트

- [ ] Code Connect / DS 컴포넌트 INSTANCE 사용
- [ ] hex/px 하드코딩 대신 변수·스타일
- [ ] 제품 폰트 (Inter 기본값 아님)
- [ ] 이미지 placeholder 없음 (imageHash 이전 완료)
- [ ] auto-layout 컨테이너 (절대 좌표 남발 금지)
- [ ] 캡처 레퍼런스 레이어 삭제
- [ ] 섹션·프레임 네이밍 일관

---

## 프롬프트

`cursor/prompts/figma-sync-to-design.md` 참고.

---

## 양방향 하네스

```text
Figma ──(figma-dev / WORKFLOW)──► Next.js 코드
                                      │
Next.js 코드 ──(figma-sync / CODE_TO_FIGMA)──► Figma
```

Design ↔ Code 루프를 한 저장소에서 관리합니다.
