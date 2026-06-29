# 이력서 · 포트폴리오 요약

> Cursor AI + Figma MCP를 연동한 디자인-코드 퍼블리싱 하네스를 설계하여, Figma→Next.js 변환 워크플로우의 일관성과 생산성을 개선

**저장소**: [github.com/dayainow/figma-publish](https://github.com/dayainow/figma-publish)

---

## 한 줄 요약

Figma 디자인을 Next.js + Tailwind 코드로 옮기는 과정을 **Cursor AI + Figma MCP**로 표준화한 **퍼블리싱 하네스(Publishing Harness)** 를 설계·구축. AI 에이전트가 매번 다른 방식으로 구현하는 문제를 줄이고, 디자인-코드 간 일관성·속도·품질을 동시에 높이는 것이 목표.

---

## 불릿 포인트 (2~3개)

- **AI 워크플로우 표준화**: Cursor Skills/Rules/Prompts + Figma MCP(Remote·Desktop·Context) 3종 연동으로 Figma→Next.js 퍼블 파이프라인 구축
- **품질·비용 최적화**: node-id 전 깊이 재귀 수집 규칙과 MCP 호출 1회 원칙을 도입해 UI 누락 방지 및 LLM 토큰 사용량 절감
- **팀 확장성**: install script와 MCP 설정 템플릿으로 신규 프로젝트 온보딩 자동화, 디자인 토큰·에셋·린트 체크리스트까지 포함한 품질 게이트 정의

---

## STAR 형식

| | |
| --- | --- |
| **Situation** | Figma 디자인을 코드로 옮길 때 AI 도구 사용이 보편화됐으나, 프롬프트·MCP 호출 방식이 제각각이라 품질 편차와 누락 이슈가 반복됨 |
| **Task** | 팀 전체가 동일한 기준으로 AI를 활용할 수 있는 재사용 가능한 퍼블리싱 하네스 필요 |
| **Action** | Figma MCP 3종 연동, node-id 재귀·토큰 최적화 규칙을 Skill/Rule/Prompt로 계층화하고, install script로 프로젝트별 즉시 배포 가능하게 패키징 |
| **Result** | 표준 워크플로우 확립으로 퍼블 일관성 향상, 온보딩·재작업 비용 감소 *(팀 측정값으로 교체)* |

---

## 배경 · 해결한 문제

| 기존 Pain Point | 개선 방향 |
| --- | --- |
| Figma → 코드 변환이 담당자·프롬프트마다 달라 품질 편차 발생 | Skills / Rules / Prompts로 **워크플로우 고정** |
| 루트 node-id만 조회 시 자식 요소(CTA, 푸터 등) 누락 | `get_metadata` **전 깊이 재귀 수집** 규칙화 |
| MCP 호출 과다로 토큰·비용·시간 낭비 | 도구별 사용 기준·1회 호출 원칙으로 **토큰 최적화** |
| Figma 임시 에셋 URL(7일 만료) 의존 | 도메인별 로컬 저장 + 상수 파일 관리 |
| 신규 팀원 온보딩 비용 | `install.sh` 한 번으로 프로젝트 `.cursor/` 셋업 |

---

## 핵심 기술 스택

- **AI IDE**: Cursor (Agent, Skills, Rules, Prompts)
- **MCP (Model Context Protocol)**
  - Figma Remote MCP (`mcp.figma.com`)
  - Figma Desktop MCP (Dev Mode, 로컬)
  - Figma Context MCP (`figma-developer-mcp`, REST API)
- **프론트엔드**: Next.js App Router, React, Tailwind CSS
- **디자인 연동**: Figma node-id, design tokens, Code Connect
- **자동화**: Bash install script, MCP 프로젝트 설정 템플릿

---

## 기대 효과 · 정량화 포인트

> 실제 수치는 팀 내 측정값으로 교체해 사용하세요.

- **일관성**: Figma→코드 변환 절차를 문서·스킬·룰로 표준화 → 담당자 간 산출물 편차 감소
- **속도**: 반복 프롬프트·MCP 호출 최소화 → 섹션 단위 퍼블 리드타임 단축
- **품질**: node-id 누락 방지·토큰 매핑·린트 체크리스트로 회귀 버그 감소
- **확장성**: `install.sh`로 다른 레포/브랜치에 동일 하네스 즉시 이식
- **비용**: `get_metadata` / `get_screenshot` 우선 전략으로 LLM 토큰 사용량 절감

---

## 키워드 (ATS · 검색용)

`AI Workflow` · `Cursor` · `MCP` · `Figma MCP` · `Design-to-Code` · `Next.js` · `Tailwind CSS` · `Design Tokens` · `Developer Experience` · `프롬프트 엔지니어링` · `AI 에이전트` · `퍼블리싱 자동화`
