#!/bin/bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // "unknown"')
mkdir -p "$CLAUDE_PROJECT_DIR/.claude/dev-log"
echo "$(date '+%H:%M:%S') | $TOOL | $FILE" >> "$CLAUDE_PROJECT_DIR/.claude/dev-log/$(date '+%Y-%m-%d').log"
