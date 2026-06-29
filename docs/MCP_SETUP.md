# MCP 설정 가이드

Figma Publish Harness는 **Figma MCP 3종**을 조합해 사용합니다.

| MCP | 연결 방식 | 용도 |
| --- | --- | --- |
| **Figma Remote MCP** | `https://mcp.figma.com/mcp` | 권장. Cursor 플러그인으로 OAuth 연결 |
| **Figma Desktop MCP** | `http://127.0.0.1:3845/mcp` | Dev Mode, 로컬 파일 직접 접근 |
| **Figma Context MCP** | `figma-developer-mcp` (REST API) | node-id 기반 메타데이터·에셋 다운로드 |

---

## 5분 셋업 체크리스트

### A. Remote Figma MCP (권장 — 먼저)

1. Cursor 채팅 → `/add-plugin figma`
2. **Settings → Tools & MCP → figma → Connect**
3. Figma 계정 인증

### B. Figma Context MCP

1. [Figma Personal Access Token](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens) 발급
2. 셸에 등록:

```bash
export FIGMA_API_KEY="figd_..."
```

3. `./install.sh .` 실행 후 Cursor **재시작**
4. MCP 목록에서 `figmaContextMcp` 연결 확인

### C. Figma Desktop MCP (선택)

1. Figma 데스크톱 앱 → Dev Mode → MCP server Enable
2. `http://127.0.0.1:3845/mcp` (`figma-desktop` 항목)

---

## mcp.json 템플릿

`install.sh` 실행 시 `.cursor/mcp.json`이 없으면 아래 템플릿이 복사됩니다.

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "headers": {}
    },
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp",
      "headers": {}
    },
    "figmaContextMcp": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "${env:FIGMA_API_KEY}"
      }
    }
  }
}
```

> `.cursor/mcp.json`은 gitignore 대상이므로 **로컬 전용**입니다.  
> 팀원마다 `install.sh` + 환경 변수 설정이 필요합니다.

---

## URL 파싱 규칙

Figma URL에서 fileKey와 nodeId를 추출할 때:

| URL 형식 | fileKey | nodeId 변환 |
| --- | --- | --- |
| `figma.com/design/:fileKey/...?node-id=1-2` | `:fileKey` | `1:2` (하이픈 → 콜론) |
| `figma.com/design/:fileKey/branch/:branchKey/...` | `:branchKey` | branchKey를 fileKey로 사용 |
| `figma.com/board/:fileKey/...` | FigJam 파일 | `get_figjam` 사용 |

---

## 도구 선택 가이드

Remote MCP(`figma`)와 Desktop MCP(`figma-desktop`) 중 **연결된 서버**를 사용합니다.

### 읽기 — Design → Code

| 작업 | 권장 도구 | MCP |
| --- | --- | --- |
| 디자인 토큰 조회 | `get_variable_defs` | Remote / Desktop |
| node 트리·레이아웃 | `get_metadata` | Remote / Desktop / Context |
| 코드 참고 스니펫 | `get_design_context` | Remote / Desktop |
| 스크린샷만 필요 | `get_screenshot` | Remote / Desktop |
| Code Connect 매핑 | `get_code_connect_map` | Remote |
| REST API 기반 에셋 | Figma Context MCP | Context |

### 쓰기 — Code → Figma

| 작업 | 권장 도구 | MCP |
| --- | --- | --- |
| 웹 페이지 픽셀 캡처 | `generate_figma_design` | Remote (figma 플러그인) |
| DS 컴포넌트 조립·수정 | `use_figma` | Remote / Desktop |
| 컴포넌트·변수 검색 | `search_design_system` | Remote |
| 라이브러리 목록 | `get_libraries` | Remote |
| 새 Figma 파일 | `create_new_file` | Remote |

> Code → Figma 상세: [CODE_TO_FIGMA.md](./CODE_TO_FIGMA.md)

---

## 트러블슈팅

| 증상 | 해결 |
| --- | --- |
| MCP 목록에 figma 없음 | `/add-plugin figma` 후 Cursor 재시작 |
| figmaContextMcp 연결 실패 | `FIGMA_API_KEY` 환경 변수 확인, `npx figma-developer-mcp` 수동 실행 테스트 |
| Desktop MCP 404 | Figma 데스크톱 앱 Dev Mode → MCP server Enable 확인 |
| node-id 누락 | `get_metadata` 재귀 수집 규칙 적용 — [WORKFLOW.md](./WORKFLOW.md) 참고 |
