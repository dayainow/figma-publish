# 이력서 · 포트폴리오 요약

> Cursor AI + Figma MCP를 연동한 **양방향** 디자인-코드 하네스를 설계하여, Figma↔Next.js 변환 워크플로우의 일관성과 생산성을 개선

**저장소**: [github.com/dayainow/figma-publish](https://github.com/dayainow/figma-publish)

---

## 한 줄 요약

Figma ↔ Next.js **양방향** 변환을 **Cursor AI + Figma MCP**로 표준화한 **퍼블리싱 하네스**를 설계·구축. Design→Code 퍼블뿐 아니라 Code→Figma 동기화까지 Skill/Rule/Prompt로 고정해 AI 에이전트 산출물 편차·UI 누락·토큰 낭비를 줄임.

---

## 불릿 포인트 (3~4개)

- **AI 워크플로우 표준화**: Cursor Skills/Rules/Prompts + Figma MCP 3종 연동으로 **Figma→Next.js 퍼블** 및 **Code→Figma 동기화** 양방향 파이프라인 구축
- **Design → Code**: node-id 전 깊이 재귀 수집·MCP 1회 호출 원칙으로 UI 누락 방지 및 LLM 토큰 절감
- **Code → Figma**: `generate_figma_design` 픽셀 캡처 + `use_figma` DS 컴포넌트 조립 **병렬 워크플로우**로 편집 가능한 Figma 화면 생성
- **팀 확장성**: install script와 MCP 설정 템플릿으로 신규 프로젝트 온보딩 자동화, 양방향 품질 게이트 정의

---

## STAR 형식

| | |
| --- | --- |
| **Situation** | Figma-코드 변환이 AI 도구로 보편화됐으나, 프롬프트·MCP 호출·역방향 sync 방식이 제각각이라 품질 편차·누락·드리프트가 반복됨 |
| **Task** | 팀 전체가 동일 기준으로 **퍼블(Design→Code)** 과 **동기화(Code→Figma)** 를 수행할 재사용 가능한 하네스 필요 |
| **Action** | Figma MCP 3종 연동, 양방향 규칙을 figma-dev/figma-sync Skill·Rule·Prompt로 계층화, install script로 즉시 배포 |
| **Result** | 표준 워크플로우 확립으로 퍼블·sync 일관성 향상, 온보딩·재작업 비용 감소 *(팀 측정값으로 교체)* |

---

## 배경 · 해결한 문제

| Pain Point | 개선 방향 |
| --- | --- |
| Figma → 코드 품질 편차 | `figma-dev` Skill + 읽기 MCP 1회 원칙 |
| node-id 누락 (CTA, 푸터) | `get_metadata` 전 깊이 재귀 |
| 코드 → Figma가 스크린샷만 | `use_figma` + DS INSTANCE 병렬 |
| 이미지 import 실패 | `generate_figma_design` + imageHash 이전 |
| MCP 과다 호출 | 도구별 사용 기준·토큰 최적화 |
| 온보딩 비용 | `install.sh` → `.cursor/` 자동 셋업 |

---

## 핵심 기술 스택

- **AI IDE**: Cursor (Agent, Skills, Rules, Prompts)
- **MCP**: Figma Remote · Desktop · Context
- **읽기 MCP**: `get_metadata`, `get_design_context`, `get_variable_defs`
- **쓰기 MCP**: `generate_figma_design`, `use_figma`, `search_design_system`
- **프론트엔드**: Next.js App Router, React, Tailwind CSS
- **디자인 연동**: node-id, design tokens, Code Connect

---

## 키워드 (ATS · 검색용)

`AI Workflow` · `Cursor` · `MCP` · `Figma MCP` · `Design-to-Code` · `Code-to-Design` · `Next.js` · `Tailwind CSS` · `Design Tokens` · `Developer Experience` · `프롬프트 엔지니어링` · `AI 에이전트` · `퍼블리싱 자동화` · `디자인 동기화`
