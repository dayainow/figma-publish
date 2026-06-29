# Figma 퍼블 — 빠른 프롬프트

Figma URL을 `<URL>` 자리에 넣고 채팅에 붙여넣기.

---

## 섹션 퍼블

```
이 Figma 프레임을 Next.js App Router + Tailwind로 구현해줘.

Figma: <URL>
섹션: 
node-id: 

1. get_variable_defs → 토큰
2. get_metadata → 자식 node-id 재귀 수집
3. get_design_context 1회

- 공통 컴포넌트 우선, button/card/input 분리
- 동일 스타일은 부모 className 한 번
- md/lg 반응형, 접근성 포함
- 이미지: public/images/<도메인>/ + figma-assets.ts
```

---

## 검증

```
Figma vs 구현 검증. 파일: 
Figma: <URL> node-id: 
get_metadata 후 불일치 구간만 get_design_context.
```
