#!/bin/bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | sed 's/"tool_name":"//;s/"//')
FILE=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"//')
FILE=${FILE:-unknown}
mkdir -p "$CLAUDE_PROJECT_DIR/.claude/dev-log"
echo "$(date '+%H:%M:%S') | $TOOL | $FILE" >> "$CLAUDE_PROJECT_DIR/.claude/dev-log/$(date '+%Y-%m-%d').log"
