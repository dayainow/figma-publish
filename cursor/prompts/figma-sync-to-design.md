# Code → Figma — 빠른 프롬프트

퍼블 완료된 화면을 Figma로 옮길 때 채팅에 붙여넣기.

---

## 페이지 전체 (웹앱 · 병렬 권장)

```
이 Next.js 페이지를 Figma로 옮겨줘.

소스: src/app/<경로>/page.tsx
로컬 URL: http://localhost:3000/<경로>
Figma: <URL 또는 fileKey>

1. fileKey 없으면 create_new_file
2. 코드에서 섹션·컴포넌트·폰트·이미지 파악
3. 병렬:
   - generate_figma_design → 픽셀 캡처
   - Code Connect / DS key 수집 → use_figma로 DS 컴포넌트 조립
4. 캡처 기준 레이아웃 맞추기, imageHash 이전
5. 캡처 레퍼런스 레이어 삭제

- hex/px 하드코딩 금지, DS 변수·스타일 우선
- figma-sync 스킬 + figma-use 스킬 따르기
```

---

## 섹션만 (Hero, Footer 등)

```
이 섹션만 Figma로 옮겨줘.

소스: src/components/<Section>.tsx
Figma: <URL> node-id: <부모 프레임>
로컬 URL: http://localhost:3000/#<anchor> (또는 해당 페이지)

1. Code Connect로 Button/Card 등 key 수집
2. use_figma로 해당 node-id 아래에 INSTANCE 조립
3. 이미지 있으면 generate_figma_design으로 해당 구간 캡처 후 imageHash 이전
```

---

## 코드 변경 → Figma 동기화 (이미 캡처됨)

```
코드 변경을 Figma 화면에 반영해줘.

변경 파일: 
Figma: <URL> node-id: <화면 프레임>

- generate_figma_design 재캡처 없이 use_figma만
- 기존 INSTANCE 유지, 텍스트·variant·spacing만 업데이트
- get_metadata로 구조 확인 후 수정
```

---

## 스크린샷 아카이브만 (DS 불필요)

```
이 URL을 Figma에 캡처만 해줘.

URL: http://localhost:3000/<경로>
Figma: <URL>

generate_figma_design만 사용. DS 조립 불필요.
```
