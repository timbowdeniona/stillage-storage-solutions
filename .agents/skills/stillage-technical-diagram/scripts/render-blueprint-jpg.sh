#!/usr/bin/env bash
# Build editable layered SVG from src/data/blueprint-specs.json and export a crisp 1200x896 .jpg
# to both pics/pic-with-measurements/tech-diagrams/ and public/images/products/.
#
# Usage:
#   render-blueprint-jpg.sh <sku-lowercase> [--svg-only | --jpg-only]
# Example:
#   render-blueprint-jpg.sh hdps-1

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <sku-lowercase> [--svg-only | --jpg-only]" >&2
  exit 1
fi

SKU_LOWER="$(echo "$1" | tr '[:upper:]' '[:lower:]')"
MODE="${2:-all}"

SVG_PUBLIC="public/images/blueprints/${SKU_LOWER}-editable.svg"
SVG_TECH="pics/pic-with-measurements/tech-diagrams/${SKU_LOWER}-editable.svg"
JPG_TECH="pics/pic-with-measurements/tech-diagrams/${SKU_LOWER}-blueprint.jpg"
JPG_PUBLIC="public/images/products/${SKU_LOWER}-blueprint.jpg"
TMP_PNG="/tmp/${SKU_LOWER}-blueprint.png"
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ "$MODE" != "--jpg-only" ]; then
  node scripts/generate-editable-blueprints.mjs
  if [ ! -f "$SVG_PUBLIC" ]; then
    echo "ERROR: Expected generated SVG not found at $SVG_PUBLIC" >&2
    exit 1
  fi
  mkdir -p "$(dirname "$SVG_TECH")"
  cp "$SVG_PUBLIC" "$SVG_TECH"
  echo "Synced editable SVG -> $SVG_TECH"
fi

if [ "$MODE" = "--svg-only" ]; then
  exit 0
fi

if [ ! -x "$CHROME_BIN" ]; then
  echo "ERROR: Google Chrome not found at $CHROME_BIN" >&2
  exit 1
fi

ABS_SVG="$(cd "$(dirname "$SVG_TECH")" && pwd)/$(basename "$SVG_TECH")"
"$CHROME_BIN" \
  --headless=new \
  --disable-gpu \
  --window-size=1200,896 \
  --hide-scrollbars \
  --screenshot="$TMP_PNG" \
  "file://${ABS_SVG}"

sips -s format jpeg -s formatOptions 94 "$TMP_PNG" --out "$JPG_TECH" >/dev/null
mkdir -p "$(dirname "$JPG_PUBLIC")"
cp "$JPG_TECH" "$JPG_PUBLIC"

echo "Rendered 1200x896 JPEG blueprint:"
echo "  - $JPG_TECH"
echo "  - $JPG_PUBLIC"
echo "  - Preview PNG: $TMP_PNG"
