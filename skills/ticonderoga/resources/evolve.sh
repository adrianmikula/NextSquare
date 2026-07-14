#!/usr/bin/env bash
set -euo pipefail

WINNER="${1:?Usage: evolve.sh <winner.html> <tastegraph.json> [output-file]}"
TASTEGRAPH="${2:?Usage: evolve.sh <winner.html> <tastegraph.json> [output-file]}"
OUTPUT="${3:-tastegraph-evolved.json}"
TICONDEROGA_DIR=".ticonderoga"

if [ ! -d "$TICONDEROGA_DIR" ]; then
  echo "Ticonderoga not set up. Run skills/ticonderoga/resources/setup.sh first."
  exit 1
fi

cd "$TICONDEROGA_DIR"
bun run evolve "../$WINNER" "../$TASTEGRAPH" > "../$OUTPUT"
echo "Evolved TasteGraph written to $OUTPUT"
