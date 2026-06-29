---
name: figma-sync
description: |
  Code → Figma 역방향 동기화 전문 스킬. 퍼블 완료된 Next.js 화면을 Figma로 옮기거나 디자인-코드 드리프트를 맞출 때 이 스킬을 따른다.
  "Figma로 옮겨", "write to Figma", "push to Figma", "코드를 Figma에", "Figma 동기화", "generate_figma_design", "use_figma" 키워드가 나오면 참조한다.
---

# Figma-Sync Skill (Code → Design)

퍼블된 코드를 Figma 디자인 파일로 되돌리는 규칙과 워크플로우.  
상세: [CODE_TO_FIGMA.md](https://github.com/dayainow/figma-publish/blob/main/docs/CODE_TO_FIGMA.md)

> Cursor Figma 플러그인의 **`figma-use`**, **`figma-generate-design`** 스킬이 설치되어 있으면 `use_figma` / 화면 조립 전에 함께 로드한다.

---

## 규칙 1: 도구 선택

| 목적 | 도구 | 비고 |
| --- | --- | --- |
| 웹앱 픽셀 캡처 (첫 import) | `generate_figma_design` | fileKey 필수, captureId 폴링 |
| DS 컴포넌트로 화면 조립·수정 | `use_figma` | Plugin API, 단계별 작은 스크립트 |
| 컴포넌트·변수 검색 | `search_design_system` | Code Connect·기존 화면 이후 **마지막** |
| 라이브러리 목록 | `get_libraries` | search 범위 좁히기 |
| 새 파일 | `create_new_file` | fileKey 없을 때 |

**이미 Figma에 캡처된 화면을 코드 변경에 맞춰 업데이트** → `use_figma`만.  
**웹앱 + 이미지 포함 첫 캡처** → `generate_figma_design` + `use_figma` **병렬 필수**.

---

## 규칙 2: 병렬 워크플로우 (Next.js 웹앱)

```text
1. fileKey 확보 (create_new_file)
2. 코드에서 섹션·컴포넌트·폰트·이미지 여부 파악
3. 병렬:
   a. generate_figma_design(fileKey) → localhost/배포 URL 캡처
   b. Code Connect → DS key 수집 → use_figma로 섹션 조립
4. 캡처 레이아웃 기준으로 use_figma 출력 정교화
5. 이미지: 캡처 imageHash → use_figma fill 복사
6. 검증 후 캡처 레이어 삭제
```

---

## 규칙 3: DS 수집 순서 (하드 게이트)

`search_design_system` 호출 **전에** 아래를 반드시 시도:

1. **Code Connect** — `*.figma.ts`, `*.figma.tsx`에서 component URL → key
2. **기존 Figma 화면** — INSTANCE walk로 key 추출
3. **search_design_system** — 미해결분만, `get_libraries`로 범위 제한

hex 색·px spacing 하드코딩 금지 — 변수·텍스트 스타일 우선.

---

## 규칙 4: use_figma 작성 원칙

- **작은 단계**로 여러 번 호출 (한 번에 거대 스크립트 금지)
- `return`으로 생성·변경 node ID 반환
- auto-layout 컨테이너 사용 (관련 자식은 `createAutoLayout`)
- 텍스트 수정: **font load → await → mutate**
- 에러 시 즉시 재시도 금지 — 메시지 읽고 스크립트 수정

---

## 규칙 5: generate_figma_design 폴링

```text
1. generate_figma_design({ fileKey }) → captureId
2. 5초 간격으로 generate_figma_design({ fileKey, captureId }) 폴링
3. status === 'completed'까지 (최대 10회)
4. captureId는 1회용 — 페이지마다 새로 호출
```

로컬: dev server 실행 후 URL 지정.  
외부 URL: Playwright MCP 캡처 (플러그인 가이드 따름).

---

## 체크리스트 (Code → Figma 전)

- [ ] Figma MCP(figma) Connect 됨
- [ ] fileKey / Figma URL 있음
- [ ] 소스 TSX + 렌더 URL 확인
- [ ] 이미지 있으면 병렬 캡처 예정
- [ ] Code Connect / DS key 수집 완료 후 use_figma mutate

## 체크리스트 (완료 후)

- [ ] DS INSTANCE 사용
- [ ] 제품 폰트 일치
- [ ] 이미지 blank 없음
- [ ] 캡처 레퍼런스 삭제
- [ ] 프레임·섹션 네이밍
