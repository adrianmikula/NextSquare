#!/usr/bin/env bash
set -euo pipefail

TICONDEROGA_DIR=".ticonderoga"

if [ -d "$TICONDEROGA_DIR" ]; then
  echo "Ticonderoga already cloned at $TICONDEROGA_DIR"
else
  echo "Cloning Ticonderoga..."
  git clone https://github.com/kelleyperry/ticonderoga.git "$TICONDEROGA_DIR"
fi

cd "$TICONDEROGA_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  bun install
fi

if ! command -v playwright &> /dev/null; then
  echo "Installing Playwright browsers..."
  npx playwright install chromium
fi

echo "Ticonderoga ready at $TICONDEROGA_DIR"
