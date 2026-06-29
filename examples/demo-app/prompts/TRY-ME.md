# TRY-ME — Cursor 채팅 붙여넣기용

데모 앱: `examples/demo-app` · URL: **http://localhost:3456**

사전 준비:

```bash
cd examples/demo-app
chmod +x setup.sh && ./setup.sh
npm run dev
```

Cursor: `/add-plugin figma` → MCP Connect

---

## 시나리오 A — Code → Figma (추천, 먼저 해보기)

데모 코드가 이미 있으므로 **역방향**부터 연습하기 좋습니다.

```
figma-publish 하네스 figma-sync 스킬을 따라,
이 데모 Next.js 페이지 전체를 Figma로 옮겨줘.

소스:
- examples/demo-app/src/app/page.tsx
- examples/demo-app/src/components/demo/

로컬 URL: http://localhost:3456
Figma: <여기에 본인 Figma 파일 URL 붙여넣기>
(파일 없으면 create_new_file로 "Figma Publish Demo" 생성)

1. 코드에서 Hero / FeatureGrid / CtaBanner / Header / Footer 섹션 파악
2. 이미지 있음 → generate_figma_design + use_figma 병렬
3. Code Connect 없으면 search_design_system은 마지막
4. 캡처 레이아웃 맞춘 뒤 캡처 레이어 삭제

포트 3456 dev server는 이미 실행 중.
```

---

## 시나리오 B — Design → Code (Figma → 퍼블)

Figma에 시나리오 A 결과(또는 본인 디자인)가 있을 때:

```
figma-publish 하네스 figma-dev 스킬을 따라,
아래 Figma 프레임을 examples/demo-app 스타일로 새 컴포넌트로 구현해줘.

Figma: <URL>
섹션: Hero (또는 전체 페이지)

1. get_variable_defs → Tailwind 토큰
2. get_metadata → 자식 node-id 전 깊이 재귀
3. get_design_context 1회

- src/components/demo/ 패턴·DemoButton 재사용
- 이미지: public/images/demo/ + src/constants/figma-assets.ts
- 완료 후 npm run lint
```

---

## 시나리오 C — 섹션만 (Hero만)

```
HeroSection만 Figma로 옮겨줘.

소스: examples/demo-app/src/components/demo/HeroSection.tsx
URL: http://localhost:3456#hero
Figma: <URL> node-id: <부모 프레임>

use_figma로 Hero auto-layout 조립.
이미지는 generate_figma_design 캡처에서 imageHash 이전.
```

---

## 시나리오 D — 검증 (Figma vs 코드)

```
Figma vs examples/demo-app 구현 검증.

코드: examples/demo-app/src/app/page.tsx
Figma: <URL> node-id: <루트 프레임>

get_metadata 후 불일치 구간만 get_design_context.
```

---

## 체크리스트

### Code → Figma 완료 후

- [ ] Header · Hero · Features · CTA · Footer 모두 Figma에 있음
- [ ] Hero 이미지 blank 아님
- [ ] 캡처 레퍼런스 레이어 삭제됨

### Design → Code 완료 후

- [ ] `npm run dev` → localhost:3456 정상
- [ ] CTA·Footer 누락 없음
- [ ] `npm run lint` 통과

---

## 데모 페이지 구성 (node-id 연습용)

| 섹션 | 파일 | 테스트 포인트 |
| --- | --- | --- |
| Header | `SiteHeader.tsx` | nav 링크 2개 |
| Hero | `HeroSection.tsx` | badge, h1, 2 buttons, **이미지** |
| Features | `FeatureGrid.tsx` | 카드 3개 |
| CTA | `CtaBanner.tsx` | gradient 배경, button |
| Footer | `SiteFooter.tsx` | 푸터 텍스트 |
