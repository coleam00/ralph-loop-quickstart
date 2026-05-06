#!/bin/bash
# Ralph Loop Project Initializer
# Usage: bash ~/.claude/ralph-loop-quickstart/init.sh [project-directory]
# Copies Ralph Loop files into your project so you can run ./ralph.sh

set -e

SRC="$HOME/.claude/ralph-loop-quickstart"
DEST="${1:-.}"

if [ ! -d "$DEST" ]; then
  echo "Error: $DEST is not a directory"
  echo "Usage: bash $0 [project-directory]"
  exit 1
fi

echo "Initializing Ralph Loop in: $DEST"

# Copy core files
cp -v "$SRC/ralph.sh" "$DEST/"
cp -v "$SRC/PROMPT.md" "$DEST/"
cp -v "$SRC/activity.md" "$DEST/"
cp -v "$SRC/.gitignore" "$DEST/"

# Copy .claude config (merge, don't overwrite)
mkdir -p "$DEST/.claude"
if [ -f "$DEST/.claude/settings.json" ]; then
  echo "Notice: $DEST/.claude/settings.json already exists, skipping copy"
else
  cp -v "$SRC/.claude/settings.json" "$DEST/.claude/"
fi

# Copy commands
mkdir -p "$DEST/.claude/commands"
if [ -f "$DEST/.claude/commands/create-prd.md" ]; then
  echo "Notice: create-prd.md already exists, skipping copy"
else
  cp -v "$SRC/.claude/commands/create-prd.md" "$DEST/.claude/commands/"
fi

# Copy skills
mkdir -p "$DEST/.claude/skills"
if [ -d "$DEST/.claude/skills/agent-browser-skill" ]; then
  echo "Notice: agent-browser-skill already exists, skipping copy"
else
  cp -rv "$SRC/.claude/skills/agent-browser-skill" "$DEST/.claude/skills/"
fi

chmod +x "$DEST/ralph.sh"

echo ""
echo "Done! Next steps:"
echo "  1. cd $DEST"
echo "  2. Run /create-prd in Claude Code"
echo "  3. Review generated prd.md and PROMPT.md"
echo "  4. Start: ./ralph.sh 20"
