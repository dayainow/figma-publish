#!/usr/bin/env bash
# 데모 앱 + 하네스 한 번에 셋업
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== 1. npm install ==="
cd "$SCRIPT_DIR"
npm install

echo ""
echo "=== 2. Cursor 하네스 설치 (.cursor/) ==="
"$REPO_ROOT/install.sh" "$SCRIPT_DIR"

echo ""
echo "=== 3. 완료 ==="
echo "다음 명령으로 데모 실행:"
echo "  cd $SCRIPT_DIR"
echo "  npm run dev"
echo ""
echo "브라우저: http://localhost:3456"
echo "연습 가이드: examples/demo-app/prompts/TRY-ME.md"
