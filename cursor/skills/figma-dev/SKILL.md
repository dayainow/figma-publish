---
name: figma-dev
description: |
  Figma 퍼블리싱 전문 스킬. Figma MCP로 디자인을 코드로 옮길 때 반드시 이 스킬의 규칙을 따른다.
  "피그마", "figma", "퍼블", "publish", "node-id", "디자인 구현", "get_design_context", "get_metadata" 키워드가 나오면 이 스킬을 참조한다.
  이미지 에셋 저장·도메인 분류 작업에도 적용한다.
---

# Figma-Dev Skill

Figma 퍼블리싱의 규칙과 워크플로우를 담는다.  
상세: [figma-publish README](https://github.com/dayainow/figma-publish), [WORKFLOW.md](https://github.com/dayainow/figma-publish/blob/main/docs/WORKFLOW.md)

---

## 규칙 1: node-id 재귀 처리 (필수)

루트 node-id 1개만으로는 **자식 요소의 상세 정보가 누락**된다.  
Figma 퍼블/검증 작업 시 아래 3단계를 반드시 따른다.

### 단계별 절차

**1) 자식 node-id 전부 수집**
```
get_metadata(node-id: "<루트 node-id>")
  → 응답의 children을 모든 깊이까지 재귀 순회
  → descendant node-id를 빠짐없이 수집
```

**2) 수집한 범위로 컨텍스트 요청**
```
get_design_context(node-ids: [루트 + 모든 자식 node-id])
  → 자식 요소까지 레이아웃·텍스트·스타일이 요청 범위에 포함되도록
```

**3) 검증 시에도 동일 절차 적용**
```
구현 ↔ 디자인 비교가 필요할 때도 1)~2) 재실행
  → 누락/불일치 점검
```

> 이 규칙은 홈/검색 등 단일 페이지 프레임 전체 퍼블에서 특히 필수.  
> 부분 선택 시 CTA·푸터·배너 등이 빠지는 것을 방지한다.

---

## 규칙 2: 도구별 사용 기준 & 토큰 최적화

| 목적 | 사용 도구 | 시점 | 토큰 절약 팁 |
|------|-----------|------|-------------|
| 화면 전체 퍼블 (1차) | `get_design_context` | 프레임을 코드로 옮길 때 1회만 | `forceCode`는 꼭 필요할 때만 `true`. 받은 후 로컬에서 리팩터링, 재호출 최소화 |
| 레이아웃 위치/크기 확인 | `get_metadata` | 컴포넌트 배치가 궁금할 때 | 스타일·텍스트 불필요 시 이 도구 우선 — 토큰 대폭 절감 |
| 색/타이포/토큰 확인 | `get_variable_defs` | Tailwind 토큰 매핑, 색·폰트 확인 | 전체 프레임 대신 변수 정의만 따로 조회 후 수동 매핑 |
| 디자인 스냅샷 참조 | `get_screenshot` | 이미지로만 레이아웃 파악 가능할 때 | LLM 맥락 없이 이미지만 수신 → 토큰 0 |
| 컴포넌트 연결 유지 | `get_code_connect_map` / `add_code_connect_map` | 초기 세팅 단계 1회 | 맵핑 후 재사용. 이후 재호출 불필요 |
| 디자인 시스템 규칙 | `create_design_system_rules` | 버튼·카드 등 핵심 컴포넌트 규칙 정의 시 | 규칙은 적게, 핵심만. 과다 규칙은 맥락 길이 증가 |

### 기본 토큰 절약 원칙

- "전체 프레임 한 번, 섹션 단위는 정말 필요한 경우에만" `get_design_context` 사용
- 이미 만든 코드·토큰 정보가 있으면 **재호출 대신 로컬 자료 우선**
- 단순 카드/배너는 `get_screenshot`만 받고 Tailwind 직접 작성

---

## 규칙 3: 권장 워크플로우

### 퍼블 1차 (화면을 "그릴 때")

```
1. Figma에서 프레임 루트 node-id 확인
2. get_metadata → children 재귀 수집 (규칙 1)
3. 수집한 node-id 범위로 get_design_context 1회 호출
   → 구조/스타일 참고해 React + Tailwind 코드 작성
4. 이후 수정은 로컬 코드에서만 진행
   → 같은 프레임 get_design_context 재호출 최소화
5. 세부 색/폰트가 애매하면 get_variable_defs로 추가 조회
```

### 검증 (구현 ↔ 디자인 비교)

```
1. get_metadata로 노드 트리·레이아웃 정보 먼저 확인
2. 레이아웃 불일치 시 → 해당 섹션 node-id만 좁혀 get_design_context 추가 호출
3. 텍스트/토큰 차이 의심 → get_variable_defs로 디자인 토큰만 비교
```

---

## 규칙 4: 이미지 에셋 도메인별 저장

Figma Context MCP로 받은 이미지 에셋은 **도메인별 경로**로 저장한다.

### 저장 경로 규칙

| 도메인 | 저장 경로 |
|--------|-----------|
| `/` · `/home` | `public/images/home/` |
| `/search` | `public/images/search/` |
| `/series` | `public/images/series/` |
| Figma 에셋 (공통) | `public/images/figma/` |
| 그 외 | `public/images/<도메인명>/` (필요 시 추가) |

### 파일명 규칙

- Figma node-id 기반 또는 `[도메인]-[블록명].ext` 형식
- `src/constants/figma-assets.ts`에 경로 상수 등록
- 코드에서 `/images/<도메인>/파일명` 형태로 참조

### 주의사항

- Figma MCP asset URL은 **7일 한도** → 로컬 저장 필수
- 다운로드 스크립트: `yarn figma:download` (`scripts/download-figma-assets.mjs`)
- 에셋 목록 매니페스트: `scripts/figma-assets-manifest.json`

---

## 체크리스트 (퍼블 작업 전)

- [ ] 루트 node-id를 `get_metadata`로 먼저 확인했는가?
- [ ] children을 모든 깊이까지 재귀 수집했는가?
- [ ] `get_design_context`를 수집한 전체 node-id 범위로 호출했는가?
- [ ] 이미지 에셋을 도메인별 경로에 저장했는가?
- [ ] `src/constants/figma-assets.ts`에 경로 상수를 등록했는가?
