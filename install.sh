#!/usr/bin/env bash
# Figma 퍼블 하네스 → 프로젝트 .cursor/ 로 복사
# Usage:
#   ./install.sh                    # harness/figma-publish/ 레이아웃 (상위 2단계 = 프로젝트 루트)
#   ./install.sh /path/to/project   # 대상 프로젝트 루트 지정
#   ./install.sh .                  # 현재 디렉터리가 Next.js 프로젝트 루트일 때
set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "$0")" && pwd)"

resolve_root() {
  if [[ -n "${1:-}" ]]; then
    cd "$1" && pwd
    return
  fi

  local parent grandparent
  parent="$(cd "$HARNESS_DIR/.." && pwd)"
  grandparent="$(cd "$HARNESS_DIR/../.." && pwd)"

  # monorepo: .../harness/figma-publish/install.sh
  if [[ "$(basename "$parent")" == "harness" ]]; then
    echo "$grandparent"
    return
  fi

  # standalone clone: 대상 프로젝트 루트를 cwd로 가정
  pwd
}

ROOT="$(resolve_root "${1:-}")"

echo "프로젝트 루트: $ROOT"
echo "하네스: $HARNESS_DIR"

mkdir -p "$ROOT/.cursor/skills/figma-dev"
mkdir -p "$ROOT/.cursor/skills/figma-sync"
mkdir -p "$ROOT/.cursor/rules"
mkdir -p "$ROOT/.cursor/prompts"

cp "$HARNESS_DIR/cursor/skills/figma-dev/SKILL.md" "$ROOT/.cursor/skills/figma-dev/SKILL.md"
cp "$HARNESS_DIR/cursor/skills/figma-sync/SKILL.md" "$ROOT/.cursor/skills/figma-sync/SKILL.md"
cp "$HARNESS_DIR/cursor/rules/figma-publish-harness.mdc" "$ROOT/.cursor/rules/figma-publish-harness.mdc"
cp "$HARNESS_DIR/cursor/rules/figma-sync-harness.mdc" "$ROOT/.cursor/rules/figma-sync-harness.mdc"
cp "$HARNESS_DIR/cursor/prompts/figma-publish.md" "$ROOT/.cursor/prompts/figma-publish.md"
cp "$HARNESS_DIR/cursor/prompts/figma-sync-to-design.md" "$ROOT/.cursor/prompts/figma-sync-to-design.md"

if [[ ! -f "$ROOT/.cursor/mcp.json" ]]; then
  cp "$HARNESS_DIR/mcp.project.json.example" "$ROOT/.cursor/mcp.json"
  echo "생성: .cursor/mcp.json"
else
  echo "유지: .cursor/mcp.json (이미 있음)"
fi

echo "완료. Cursor를 재시작하고 MCP 연결을 확인하세요."
echo "가이드: https://github.com/dayainow/figma-publish/blob/main/docs/MCP_SETUP.md"
