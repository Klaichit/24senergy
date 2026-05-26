#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# This is a pure static HTML/CSS/JS project — no npm install required.
# Install htmlhint for HTML linting during sessions.
if ! command -v htmlhint &> /dev/null; then
  npm install -g htmlhint --quiet
fi
