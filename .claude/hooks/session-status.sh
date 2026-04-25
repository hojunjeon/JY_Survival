#!/bin/bash
# phase-status.md 에서 현재 상태 1줄 추출 → stdout (UserPromptSubmit 훅이 컨텍스트에 주입)

PHASE_FILE="$CLAUDE_PROJECT_DIR/docs/phase-status.md"
[ -f "$PHASE_FILE" ] || exit 0

PHASE=$(grep -m 1 '^## 현재 Phase:' "$PHASE_FILE" | sed 's/^## 현재 Phase: //')
CYCLE=$(grep -m 1 '^### 활성 Cycle:' "$PHASE_FILE" | sed 's/^### 활성 Cycle: //')
STEP=$(grep -m 1 '^- step:' "$PHASE_FILE" | sed 's/^- step: //')

if [ -n "$CYCLE" ] && [ "$CYCLE" != "(없음)" ]; then
  echo "[상태] Phase $PHASE / Cycle: $CYCLE / Step $STEP"
else
  echo "[상태] Phase $PHASE / 활성 Cycle 없음"
fi
