# Task: 009 - Stillage Technical Diagram Generator Skill

## 1. Overview & Objectives
Extract the proven end-to-end workflow for turning a workshop photo (with handwritten measurements) or dimensional spec into a **BS 8888-compliant, multi-layer editable `.SVG` + high-resolution `.JPG` CAD technical blueprint** into a dedicated, reusable Antigravity **Workspace Skill** (`stillage-technical-diagram`).

The objective is to make generating future product technical diagrams (like `HDPS-1`, `BBFH2-1`, `SSS-PST-1120FP`) **fast, consistent, and repeatable** — so whenever you drop a new annotated photo into `pics/pic-with-measurements/` and ask to generate a technical diagram, the agent automatically activates the skill, uses deterministic helper scripts for padding/coordinate calibration/rendering, and delivers museum-grade `.svg` and `.jpg` blueprints in the exact house style.

---

## 2. Context & Client Considerations
- **Antigravity Skill Architecture** (per `agy-customizations` guidelines):
  - **Location**: Workspace skill at `.agents/skills/stillage-technical-diagram/` (version-controlled with this repository so it auto-discovers whenever working in `stillage-storage-solutions`; optionally copyable to `~/.gemini/config/skills/` if global machine-wide availability is desired later).
  - **Progressive Disclosure**: Keep `SKILL.md` concise and procedural, moving the CAD image prompt template and BS 8888 vector layout rules into `references/` so they are loaded only when needed.
  - **Zero-Dependency Deterministic Scripts**: Bundle reusable shell/Node.js helper scripts in `scripts/` using macOS `sips`, Node.js built-ins, and the existing `scripts/generate-editable-blueprints.mjs` so no Python/ImageMagick dependencies are required.
- **Consistency with Existing Blueprint Ecosystem**:
  - Outputs stay 100% compatible with [`src/data/blueprint-specs.json`](file:///Users/timbo/Dev/stillage-storage-solutions/src/data/blueprint-specs.json), [`scripts/generate-editable-blueprints.mjs`](file:///Users/timbo/Dev/stillage-storage-solutions/scripts/generate-editable-blueprints.mjs), [`src/components/EditableBlueprintStudio.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/EditableBlueprintStudio.tsx), and the `pics/pic-with-measurements/tech-diagrams/` folder convention.
  - Every generated `.svg` retains all 5 named vector layers (`layer-sheet-grid`, `layer-3d-cad-subject`, `layer-dimension-lines`, `layer-callouts`, `layer-iso-title-block`) for 1-click editing in Figma, Inkscape, Adobe Illustrator, or the in-browser Blueprint Studio.

---

## 3. Scope & Deliverables

### In-Scope:
1. **Skill Directory & Main Runbook**:
   - `.agents/skills/stillage-technical-diagram/SKILL.md` with YAML frontmatter (`name`, `description`) and the 5-stage workflow:
     1. Source photo inspection & measurement math verification (including `sips` zooming for small handwritten notes).
     2. Clean 3D CAD isometric base render generation via `image-generator`.
     3. Canvas normalisation (`1200 × 896` pure `#FFFFFF` with ~16–20% margins) & 1-pixel vertex coordinate extraction.
     4. `blueprint-specs.json` authoring & 5-layer `.svg` generation.
     5. `.svg` → `.jpg` raster export & mandatory visual QA inspection loop.
2. **Bundled Helper Scripts (`.agents/skills/stillage-technical-diagram/scripts/`)**:
   - `pad-base-render.sh`: Resizes and pads any generated base render onto an exact `1200 × 896` pure white (`#FFFFFF`) canvas and saves it to `public/images/products/base-render-<sku>.jpg`.
   - `measure-cad-vertices.mjs`: Converts the `1200 × 896` base render to temporary BMP via `sips` and outputs exact `(x, y)` bounding box, corner post tops, foot bottoms, and bottom-edge/pocket contour coordinates in JSON/console format.
   - `render-blueprint-jpg.sh`: Runs `node scripts/generate-editable-blueprints.mjs`, renders `<sku>-editable.svg` to a crisp `1200 × 896` `.jpg`, and copies both `.svg` and `.jpg` into `pics/pic-with-measurements/tech-diagrams/` and `public/images/`.
3. **Reference Guides (`.agents/skills/stillage-technical-diagram/references/`)**:
   - `cad-prompt-template.md`: Standardised prompt structure & strict negative constraints for `image-generator` (RAL 5010 shaded-with-edges SolidWorks/AutoCAD aesthetic, pure `#FFFFFF` background, zero baked-in text/arrows/grid).
   - `annotation-layout-rules.md`: BS 8888 dimension line geometry, colour semantics (`primary` `#1C2026`, `teal` `#00796B`, `amber` `#B45309`), `callout` anchor-side rules (preventing leader line doubling-back or crossing), and ISO title block formatting.

### Out-of-Scope (unless requested):
- Building the `/admin/diagrams` web UI (covered separately in [008-admin-technical-diagram-generator.md](file:///Users/timbo/Dev/stillage-storage-solutions/ai_docs/tasks/008-admin-technical-diagram-generator.md)).
- Automatically pushing new products or drawings to Contentful CMS or Algolia without explicit user instruction.
- Installing global OS packages (ImageMagick, Inkscape, librsvg).

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Skill Scaffolding & Reference Documentation
- [x] Task 1.1: Create `.agents/skills/stillage-technical-diagram/` directory structure (`scripts/`, `references/`).
- [x] Task 1.2: Author `references/cad-prompt-template.md` documenting the exact RAL 5010 shaded-with-edges isometric render prompt template, structural checklist (stacking feet, box-section rails, open/closed sides, base bearers, forklift pockets), and strict negative constraints.
- [x] Task 1.3: Author `references/annotation-layout-rules.md` capturing exact canvas dimensions (`1200 × 896`), title block safe zone (`x: 880–1176, y: 752–872`), colour coding, isometric offset guidelines, and callout `anchorX`/`elbowX` placement rules.

### Phase 2: Reusable Deterministic Helper Scripts
- [x] Task 2.1: Create executable `scripts/pad-base-render.sh` accepting `<input-image> <sku> [inner-width] [inner-height]` to resize and pad onto `1200 × 896` `#FFFFFF` and save to `public/images/products/base-render-<sku>.jpg`.
- [x] Task 2.2: Create `scripts/measure-cad-vertices.mjs` accepting `<base-render-jpg>` to scan non-white pixels via `sips` BMP conversion and report exact outer bounds, corner tops, foot bottoms, and bottom-edge contour points.
- [x] Task 2.3: Create executable `scripts/render-blueprint-jpg.sh` accepting `<sku>` to run `scripts/generate-editable-blueprints.mjs`, copy `<sku>-editable.svg` to `pics/pic-with-measurements/tech-diagrams/`, render to `1200 × 896` `.jpg` (via headless Chrome + `sips`), and save to both `pics/pic-with-measurements/tech-diagrams/<sku>-blueprint.jpg` and `public/images/products/<sku>-blueprint.jpg`.

### Phase 3: Main `SKILL.md` Runbook & Verification
- [x] Task 3.1: Author `.agents/skills/stillage-technical-diagram/SKILL.md` with clear YAML frontmatter (`name: stillage-technical-diagram`, trigger-rich `description`), concise 5-stage procedure linking to the bundled scripts and references, and a mandatory visual QA checklist.
- [x] Task 3.2: Dry-run `scripts/measure-cad-vertices.mjs` and `scripts/render-blueprint-jpg.sh` against the existing `hdps-1` assets to confirm all scripts execute cleanly with zero errors.

---

## 5. Verification & Testing Strategy
- **Skill Discovery Check**: Verify `.agents/skills/stillage-technical-diagram/SKILL.md` has valid YAML frontmatter (`name` lowercase-hyphenated, clear third-person `description`) and all relative links (`./scripts/...`, `./references/...`) resolve to existing files.
- **Script Dry-Run Verification**:
  - Run `node .agents/skills/stillage-technical-diagram/scripts/measure-cad-vertices.mjs public/images/products/base-render-hdps-1.jpg` and confirm accurate `1200 × 896` vertex output.
  - Run `.agents/skills/stillage-technical-diagram/scripts/render-blueprint-jpg.sh hdps-1` and confirm valid `.svg` (all 5 named `<g id="layer-...">` groups) and `.jpg` (`1200 × 896`) outputs.
- **Existing Test Suite**: Run `npm test` to confirm no regressions in the main Next.js project.

---

## 6. Client Handover & Operational Guide
- **How to use the skill**:
  1. Drop a workshop photo with handwritten measurements into `pics/pic-with-measurements/` (or paste dimensions in chat).
  2. Ask: *"Generate the technical diagram for `@<filename>.jpg`"* (or explicitly invoke the `stillage-technical-diagram` skill).
  3. The agent will automatically extract & verify measurements, generate the clean 3D CAD base render, calibrate exact pixel coordinates, build the 5-layer editable `.svg`, export the `.jpg`, visually inspect it, and save all outputs cleanly into `pics/pic-with-measurements/tech-diagrams/` and `public/images/`.
- **Editing after generation**: Open any generated `*-editable.svg` in **Figma**, **Inkscape**, **Adobe Illustrator**, or `/blueprint-studio` to tweak measurements or drag arrows without touching the underlying 3D steel render.
