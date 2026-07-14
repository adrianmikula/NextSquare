#!/usr/bin/env bash
set -euo pipefail

URL="${1:?Usage: deconstruct.sh <url> [output-file]}"
OUTPUT="${2:-tastegraph.json}"
TICONDEROGA_DIR=".ticonderoga"

if [ ! -d "$TICONDEROGA_DIR" ]; then
  echo "Ticonderoga not set up. Run skills/ticonderoga/resources/setup.sh first."
  exit 1
fi

cd "$TICONDEROGA_DIR"
bun run deconstruct "$URL" > "../$OUTPUT"
echo "TasteGraph written to $OUTPUT"
