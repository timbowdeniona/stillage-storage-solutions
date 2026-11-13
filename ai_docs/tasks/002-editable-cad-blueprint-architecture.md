# Task: 002 - Editable CAD Blueprint Drawing Format, Tooling & Interactive Editor Architecture

## 1. Overview & Objectives
When generating technical blueprint drawings using an AI image model alone, the output is a flat raster image (`.jpg` or `.png`) where the 3D shaded stillage, dimension lines, arrowheads, text labels, and title block are baked into a single layer of pixels. Any minor measurement tweak (such as changing `665 mm` pocket centres or deleting a `1080 mm` span line) requires re-prompting the AI or manual pixel retouching.

The objective of this plan is to establish a **100% manually editable technical blueprint workflow and file format architecture** for **Stillage Storage Solutions** so that:
1. You retain the **state-of-the-art 3D CAD shaded isometric visual quality** that the client loves.
2. Every dimension line, arrowhead, measurement text (`665 mm`, `1080 mm`, `200 x 200 mm`), structural callout (`50 x 50 mm Box Section`), and ISO title block field is stored on a **separate, live editable vector layer** that can be clicked, dragged, edited, or deleted in seconds.
3. Both technical designers (using **Figma**, **Inkscape**, **Illustrator**, or **QCAD/AutoCAD**) and the non-technical client (using a built-in browser **Interactive Blueprint Annotation Editor**) can manually adjust measurements and export print/web-ready files (`SVG`, `PNG`, `PDF`, or `DXF`).

---

## 2. Context & Client Considerations
- **Why Pure Raster (`.jpg` / `.png`) Limits Manual Editing**:
  - Text is rasterized into pixels (cannot double-click to edit a typo or measurement change).
  - Moving or deleting an arrow or leader line leaves a gap in the underlying 3D product shading and drafting grid.
- **Recommended Editable File Formats & Compatible Tools**:

| Format | How It Is Structured | Best For | Free & Paid Tools to Edit Manually |
| :--- | :--- | :--- | :--- |
| **1. Hybrid Layered `.SVG` (Recommended Primary Format)** | **Layer 1**: Vector BS 8888 grid, border & editable `<text>` Title Block<br>**Layer 2**: Clean AI-generated 3D CAD shaded stillage render (no baked-in text/arrows)<br>**Layer 3**: Editable vector `<line>` & `<marker>` dimension leaders<br>**Layer 4**: Editable `<text>` callouts & measurement labels | Keeping state-of-the-art 3D CAD visuals while making every dimension, arrow, and label 1-click editable in any vector tool or browser | **Free**: Figma (Web/Desktop), Inkscape (Mac/Win), Boxy SVG<br>**Paid**: Adobe Illustrator, Affinity Designer, CorelDRAW |
| **2. Interactive Browser Blueprint Studio (`.json` + `.svg` in Next.js)** | Extends existing [`ProductTechnicalDiagram.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/ProductTechnicalDiagram.tsx) with drag-and-drop dimension pins and inline text editing | Non-technical client self-service right in the browser with zero software installation | Built directly into your Next.js app (exports `.svg` and high-res `.png` / `.jpg` for Contentful) |
| **3. CAD Exchange `.DXF` / Vector `.PDF`** | 2D/Isometric vector linework (`LINE`, `LWPOLYLINE`, `MTEXT`, `DIMENSION` entities on named CAD layers) | Engineering fabricators, workshop jig drawings, and AutoCAD users | **Free**: QCAD, LibreCAD, Autodesk Viewer<br>**Paid**: AutoCAD, SolidWorks, DraftSight |

- **Two-Stage AI + Vector Generation Pipeline**:
  - Instead of asking the AI image model to draw text and dimension arrows into the pixels, the AI image generator produces a **clean, un-annotated 3D CAD isometric render** of the stillage in RAL 5010 Blue on a clean/transparent background.
  - A structured **Editable SVG Blueprint Builder** overlays the BS 8888 drafting grid, crisp vector extension lines, arrowheads, callout pointers, and `<text>` labels on named SVG `<g id="...">` groups so every annotation remains permanently editable.

---

## 3. Scope & Deliverables

### In-Scope:
1. **Clean 3D CAD Base Render Assets (Un-Annotated Layer)**:
   - AI-generated 3D CAD isometric base renders for `SSS-CANT-3B8A`, `SSS-MSH-1210HD`, and `BBFH2-1` with **zero baked-in text or dimension lines**, embedded or linked inside the `<g id="layer-3d-cad-subject">` layer.
2. **Multi-Layer Editable `.SVG` Blueprint Files (`public/images/blueprints/*.svg`)**:
   - Standardised SVG structure with semantic, named layers (`layer-sheet-grid`, `layer-3d-cad-subject`, `layer-dimension-lines`, `layer-callouts`, `layer-iso-title-block`) that open cleanly as separate layers in **Figma**, **Inkscape**, and **Adobe Illustrator**.
   - System/Web-safe engineering font stack (`Arial`, `Inter`, `JetBrains Mono`) so text remains editable on any computer without missing-font warnings.
3. **Interactive Browser-Based Blueprint Callout & Dimension Editor**:
   - Upgrade [`ProductTechnicalDiagram.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/ProductTechnicalDiagram.tsx) (or a dedicated `/blueprint-studio` page) so you or the client can:
     - Click any dimension or callout label to type new text (e.g., change `665 mm` or `50 x 50 mm Box Section`).
     - Drag the start `(x1, y1)` and end `(x2, y2)` anchor points of any dimension line or callout arrow directly on the canvas.
     - Add or delete dimension lines and callouts with 1 click.
     - Export as **Editable Layered `.SVG`** (for Figma/Illustrator) or **High-Resolution `.PNG` / `.JPG`** (for Contentful & client emails).
4. **Contentful CMS Integration**:
   - Support both `.svg` and `.jpg`/`.png` uploads in the `technicalDrawing` field on the `product` content type in [`scripts/contentful-sync.mjs`](file:///Users/timbo/Dev/stillage-storage-solutions/scripts/contentful-sync.mjs).

### Out-of-Scope (unless requested):
- Full 3D solid modeling kernel (STEP / IGES / SolidWorks `.SLDPRT` generation).

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Layered Editable `.SVG` Blueprint Schema & Clean Base Renders
- [x] Task 1.1: Generate clean, un-annotated 3D CAD isometric base renders (without baked-in text or arrows) for `BBFH2-1`, `SSS-CANT-3B8A`, and `SSS-MSH-1210HD` so annotations can live on a separate vector layer.
- [x] Task 1.2: Define a JSON/TypeScript annotation schema (`BlueprintAnnotationSpec`) supporting:
  - `dimensions`: Array of `{ id, label, x1, y1, x2, y2, extStart, extEnd, offset, style }` for double-arrow dimension lines with extension ticks.
  - `callouts`: Array of `{ id, text, targetX, targetY,elbowX, elbowY, labelX, labelY }` for single-arrow pointer callouts (e.g., `Stand & Main Frame: 50 x 50 mm Box Section`).
  - `titleBlock`: `{ companyName, productTitle, sku, footprintText, swlText, certifications }`.
- [x] Task 1.3: Generate standalone, layered `.svg` files in `public/images/blueprints/` (`bbfh2-1-editable.svg`, `sss-cant-3b8a-editable.svg`, `sss-msh-1210hd-editable.svg`) organized into clean `<g id="...">` layers compatible with Figma, Inkscape, and Adobe Illustrator.

### Phase 2: Interactive Browser "Blueprint Studio" Editor (Zero-Tool Manual Editing)
- [x] Task 2.1: Add an interactive **Edit Blueprint Annotations** mode to [`ProductTechnicalDiagram.tsx`](file:///Users/timbo/Dev/stillage-storage-solutions/src/components/ProductTechnicalDiagram.tsx) (or `/blueprint-studio`) allowing users to:
  - Select any dimension line or callout on the drawing and drag its endpoint handles `(x1, y1)` and `(x2, y2)` with the mouse.
  - Edit any dimension measurement or callout text inline, add new callouts/dimensions, or delete unwanted ones.
- [x] Task 2.2: Add 1-click export buttons:
  - **Export Editable `.SVG`**: Downloads the multi-layer vector SVG with embedded base image so it opens as a self-contained editable file in Figma, Inkscape, or Illustrator.
  - **Export High-Res `.PNG` / `.JPG`**: Renders the SVG onto an HTML5 `<canvas>` at `2400 × 1800 px` (print/presentation quality) for instant client sharing or Contentful upload.

### Phase 3: Contentful CMS Sync & Documentation
- [x] Task 3.1: Update [`scripts/contentful-sync.mjs`](file:///Users/timbo/Dev/stillage-storage-solutions/scripts/contentful-sync.mjs) and [`src/data/seedCatalog.ts`](file:///Users/timbo/Dev/stillage-storage-solutions/src/data/seedCatalog.ts) to include the `BBFH2-1` (**Free Standing Bulk Bag Filling Hopper with Stand**) product entry and link the editable blueprint assets.
- [x] Task 3.2: Add unit tests in `tests/blog-contentful.test.mjs` verifying the layered SVG files and annotation schema.

---

## 5. Verification & Testing Strategy
- **Vector Editor Compatibility Check**: Verify that each generated `.svg` file contains distinct `<g id="layer-...">` groups, standard `<text>`, `<line>`, and `<polyline>` elements, and an embedded/linked base render so that opening the file in **Figma**, **Inkscape**, or **Illustrator** allows immediate text editing and arrow dragging.
- **Automated Test Suite**: Run `npm test` to validate all Contentful schema fields, asset files, and SVG structure assertions.
- **Browser Export Verification**: Verify both `.SVG` and high-res `.PNG` exports from the interactive Blueprint Studio.

---

## 6. Client Handover & Operational Guide
- **Option A — Zero-Install Browser Editing**: Open the Blueprint Studio on the site, click any measurement or callout to edit the text or drag the arrow endpoints, and click **Export PNG** or **Export Editable SVG**.
- **Option B — Desktop / Web Vector Editing (Figma or Inkscape)**:
  1. Drag the `.svg` file into [figma.com](https://www.figma.com) (free) or [Inkscape](https://inkscape.org) (free).
  2. Double-click any measurement text (`665 mm`, `1080 mm`, `50 x 50 mm Box Section`) to type a new value.
  3. Click and drag any arrow or dimension line to reposition or delete it without affecting the underlying 3D blue stillage illustration.
