#!/usr/bin/env bash
set -euo pipefail

TASTEGRAPH="${1:?Usage: generate.sh <tastegraph.json> [output-dir]}"
OUTPUT_DIR="${2:-variants}"
TICONDEROGA_DIR=".ticonderoga"

if [ ! -d "$TICONDEROGA_DIR" ]; then
  echo "Ticonderoga not set up. Run skills/ticonderoga/resources/setup.sh first."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
cd "$TICONDEROGA_DIR"
bun run generate "../$TASTEGRAPH" "../$OUTPUT_DIR"
echo "3 variants generated in $OUTPUT_DIR/"
ls -la "../$OUTPUT_DIR/"
