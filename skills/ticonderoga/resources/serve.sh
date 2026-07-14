#!/usr/bin/env bash
set -euo pipefail

TICONDEROGA_DIR=".ticonderoga"

if [ ! -d "$TICONDEROGA_DIR" ]; then
  echo "Ticonderoga not set up. Run skills/ticonderoga/resources/setup.sh first."
  exit 1
fi

echo "Starting Ticonderoga server (Hono backend on :7600, Vite frontend on :5173)..."
cd "$TICONDEROGA_DIR"
bun run server &
BUN_PID=$!
bun run dev &
VITE_PID=$!

echo "Backend PID: $BUN_PID"
echo "Frontend PID: $VITE_PID"
echo "Press Ctrl+C to stop both."

trap "kill $BUN_PID $VITE_PID 2>/dev/null; exit" INT TERM
wait
