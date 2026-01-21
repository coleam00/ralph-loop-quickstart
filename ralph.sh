#!/bin/bash

# Ralph Wiggum Autonomous Development Loop
# =========================================
# This script runs Claude Code in a continuous loop, each iteration with a fresh
# context window. It reads PROMPT.md and feeds it to Claude until all tasks are
# complete or max iterations is reached.
#
# Usage: ./ralph.sh <max_iterations>
# Example: ./ralph.sh 20

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for required argument
if [ -z "$1" ]; then
  echo -e "${RED}Error: Missing required argument${NC}"
  echo ""
  echo "Usage: $0 <max_iterations>"
  echo "Example: $0 20"
  exit 1
fi

MAX_ITERATIONS=$1

# Verify required files exist
if [ ! -f "PROMPT.md" ]; then
  echo -e "${RED}Error: PROMPT.md not found${NC}"
  echo "Please create PROMPT.md or run /create-prd first"
  exit 1
fi

if [ ! -f "prd.md" ]; then
  echo -e "${RED}Error: prd.md not found${NC}"
  echo "Please create your PRD or run /create-prd first"
  exit 1
fi

if [ ! -f "activity.md" ]; then
  echo -e "${YELLOW}Warning: activity.md not found, creating it...${NC}"
  cat > activity.md << 'EOF'
# Project Build - Activity Log

## Current Status
**Last Updated:** Not started
**Tasks Completed:** 0
**Current Task:** None

---

## Session Log

<!-- Agent will append dated entries here -->
EOF
fi

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   Ralph Wiggum Autonomous Loop${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Max iterations: ${GREEN}$MAX_ITERATIONS${NC}"
echo -e "Completion signal: ${GREEN}<promise>COMPLETE</promise>${NC}"
echo ""
echo -e "${YELLOW}Starting in 3 seconds... Press Ctrl+C to abort${NC}"
sleep 3
echo ""

# Main loop
for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo -e "${BLUE}======================================${NC}"
  echo -e "${BLUE}   Iteration $i of $MAX_ITERATIONS${NC}"
  echo -e "${BLUE}======================================${NC}"
  echo ""

  # Run Claude with the prompt from PROMPT.md
  # Using --output-format text for cleaner output
  result=$(claude -p "$(cat PROMPT.md)" --output-format text --dangerously-skip-permissions 2>&1) || true

  echo "$result"
  echo ""

  # Check for completion signal
  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}   ALL TASKS COMPLETE!${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    echo -e "Finished after ${GREEN}$i${NC} iteration(s)"
    echo ""
    echo "Next steps:"
    echo "  1. Review the completed work in your project"
    echo "  2. Check activity.md for the full build log"
    echo "  3. Review screenshots/ for visual verification"
    echo "  4. Run your tests to verify everything works"
    echo ""
    exit 0
  fi

  echo ""
  echo -e "${YELLOW}--- End of iteration $i ---${NC}"
  echo ""

  # Small delay between iterations to prevent hammering
  sleep 2
done

echo ""
echo -e "${RED}======================================${NC}"
echo -e "${RED}   MAX ITERATIONS REACHED${NC}"
echo -e "${RED}======================================${NC}"
echo ""
echo -e "Reached max iterations (${RED}$MAX_ITERATIONS${NC}) without completion."
echo ""
echo "Options:"
echo "  1. Run again with more iterations: ./ralph.sh 50"
echo "  2. Check activity.md to see current progress"
echo "  3. Check prd.md to see remaining tasks"
echo "  4. Manually complete remaining tasks"
echo ""
exit 1
