---
name: stillage-technical-diagram
description: >-
  Generates BS 8888-compliant multi-layer editable CAD technical blueprints (.svg and .jpg)
  for Stillage Storage Solutions products from annotated workshop photos or dimensional specs.
  Use this skill whenever the user asks to generate, create, update, or redraw a technical
  diagram or CAD blueprint from a photo in pics/pic-with-measurements/ or from product dimensions.
---

# Stillage Technical Diagram Generator

Produces matched **5-layer editable `.svg`** (Figma / Inkscape / Illustrator / `/blueprint-studio` compatible) and **high-resolution `1200 × 896` `.jpg`** technical blueprints in the Stillage Storage Solutions CAD style.

## Prerequisites & Outputs

- Source photos typically live in `pics/pic-with-measurements/`.
- Every completed diagram produces:
  1. Clean 3D CAD base render: `public/images/products/base-render-<sku>.jpg` (`1200 × 896`)
  2. Editable annotation preset: entry in `src/data/blueprint-specs.json`
  3. Multi-layer `.svg`: `public/images/blueprints/<sku>-editable.svg` & `pics/pic-with-measurements/tech-diagrams/<sku>-editable.svg`
  4. Final raster `.jpg`: `pics/pic-with-measurements/tech-diagrams/<sku>-blueprint.jpg` & `public/images/products/<sku>-blueprint.jpg`

---

## 5-Stage Workflow

### Stage 1: Inspect Photo & Verify Measurements
1. Read the source photo with `read_file`.
2. If handwritten measurements are small or dense, zoom-crop regions with `sips` into `/tmp/` and read each crop so no digit is misread:
   ```bash
   sips --cropOffset <y> <x> -c <h> <w> <photo.jpg> --out /tmp/zoom-notes.jpg
   ```
3. Cross-check dimensional math before proceeding:
   - External vs internal (`ext - int ≈ 2 × box section width`, e.g., `100 mm` for `50 × 50 mm` box).
   - Overall height vs internal height (`overall - internal = foot + base height`).
   - Forklift pockets (`inner gap + pocket width = pocket centres`).
   - Convert any `cm` values to `mm` for BS 8888 consistency.

### Stage 2: Generate & Normalise Clean 3D CAD Base Render
1. Read [cad-prompt-template.md](./references/cad-prompt-template.md).
2. Invoke the `image-generator` subagent with the exact geometry from Stage 1 and strict negative constraints (**zero text, arrows, dimensions, grid, or shadows on pure `#FFFFFF`**).
3. Inspect the generated image with `read_file` to confirm structural accuracy (post count, bays, open/closed ends, feet, base bearers, forklift pockets).
4. Resize and pad onto an exact `1200 × 896` `#FFFFFF` canvas with generous margins:
   ```bash
   .agents/skills/stillage-technical-diagram/scripts/pad-base-render.sh <generated-image-path> <sku-lowercase>
   ```

### Stage 3: Extract 1-Pixel Accurate CAD Coordinates
Run the bundled BMP coordinate scanner on the padded `1200 × 896` base render:
```bash
node .agents/skills/stillage-technical-diagram/scripts/measure-cad-vertices.mjs public/images/products/base-render-<sku-lowercase>.jpg
```
Use the returned `bounds`, `detectedTopPeaks`, `detectedBottomPeaks`, `topContour`, and `bottomContour` to anchor every dimension extension line and callout target directly onto the steelwork.

### Stage 4: Author `blueprint-specs.json` & Build Editable `.SVG`
1. Read [annotation-layout-rules.md](./references/annotation-layout-rules.md) to ensure zero overlapping labels, zero crossing leader lines, and proper `anchorX`/`elbowX` placement.
2. Add or update the `<SKU>` preset in `src/data/blueprint-specs.json` (uppercase SKU key, lowercase `fileName: "<sku>-editable.svg"`).
3. Generate and sync the 5-layer `.svg`:
   ```bash
   .agents/skills/stillage-technical-diagram/scripts/render-blueprint-jpg.sh <sku-lowercase> --svg-only
   ```

### Stage 5: Render `.JPG` & Visual QA Loop
1. Render the `.svg` to `1200 × 896` `.jpg` (note: headless Chrome on macOS may require running outside the terminal sandbox):
   ```bash
   .agents/skills/stillage-technical-diagram/scripts/render-blueprint-jpg.sh <sku-lowercase> --jpg-only
   ```
2. **Mandatory Visual QA**: Inspect `pics/pic-with-measurements/tech-diagrams/<sku-lowercase>-blueprint.jpg` (or `/tmp/<sku-lowercase>-blueprint.png`) with `read_file` and verify:
   - Every single measurement from the source photo is present and accurate.
   - Zero overlapping text pills, zero leader lines doubling back across callout boxes, zero lines crossing other lines.
   - Nothing collides with the bottom-right ISO title block (`x: 880..1176, y: 752..872`).
3. If any coordinate needs refinement, tweak `src/data/blueprint-specs.json` and re-run Stage 4–5 until visually spotless.
