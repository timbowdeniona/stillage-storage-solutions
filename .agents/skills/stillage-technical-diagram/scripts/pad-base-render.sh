#!/usr/bin/env bash
# Resize and pad a clean 3D CAD base render onto an exact 1200x896 pure white (#FFFFFF) canvas.
# Usage: pad-base-render.sh <input-image> <sku-lowercase> [inner-width] [inner-height]
# Example: pad-base-render.sh /path/to/render.jpg hdps-1 924 690

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <input-image> <sku-lowercase> [inner-width=924] [inner-height=690]" >&2
  exit 1
fi

INPUT_IMG="$1"
SKU_LOWER="$(echo "$2" | tr '[:upper:]' '[:lower:]')"
INNER_W="${3:-924}"
INNER_H="${4:-690}"

OUT_PATH="public/images/products/base-render-${SKU_LOWER}.jpg"
TMP_RESIZED="/tmp/base-render-${SKU_LOWER}-resized.jpg"

mkdir -p "$(dirname "$OUT_PATH")"

sips -z "$INNER_H" "$INNER_W" "$INPUT_IMG" --out "$TMP_RESIZED" >/dev/null
sips -p 896 1200 --padColor FFFFFF "$TMP_RESIZED" --out "$OUT_PATH" >/dev/null
rm -f "$TMP_RESIZED"

echo "Saved padded 1200x896 base render: $OUT_PATH"
sips -g pixelWidth -g pixelHeight "$OUT_PATH" | tail -n 2
