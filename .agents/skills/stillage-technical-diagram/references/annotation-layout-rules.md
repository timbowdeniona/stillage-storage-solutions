# BS 8888 Annotation & Layout Rules (`1200 × 896` Canvas)

All editable blueprints in `src/data/blueprint-specs.json` share a fixed `1200 × 896` pixel coordinate space matching the 1:1 base render.

## 1. Canvas Zones & Safe Areas

- **Outer Sheet**: `1200 × 896` (`#F8FAFC`)
- **Drafting Border**: `x: 24..1176`, `y: 24..872` (grid zones `A–F` across, `1–4` down)
- **ISO Title Block (Reserved — Keep Clear)**: `x: 880..1176`, `y: 752..872` (`296 × 120` px)
- **Safe Annotation Padding**: Keep all dimension lines, labels, and callout boxes strictly inside `x: 34..1168`, `y: 34..864`.

## 2. Colour Semantics (`COLOR_MAP`)

Use the three supported colour keys in `blueprint-specs.json`:
- `"primary"` (`#1C2026` charcoal): External overall dimensions, bay widths, structural frame callouts.
- `"teal"` (`#00796B` engineering teal): Internal dimensions/capacities, foot centres, clearance highlights.
- `"amber"` (`#B45309` industrial amber): Forklift pocket centres, fork pocket specs, mobility/handling callouts.

## 3. Dimension Line Geometry (`dimensions[]`)

Each dimension object:
```json
{
  "id": "dim-<sku>-<name>",
  "label": "3500 mm (Ext. Length)",
  "x1": 212, "y1": 378,
  "x2": 747, "y2": 76,
  "extX1": 242, "extY1": 432,
  "extX2": 777, "extY2": 130,
  "color": "primary",
  "labelSide": "above"
}
```
- **Isometric Offsets**: Offset extension lines perpendicularly outward from the steelwork (~35–60 px) so dimension lines never touch or obscure the 3D render.
- **Label Side**: Default places the white pill above the line; set `"labelSide": "below"` for bottom-edge dimensions so the label sits cleanly outside the stillage.
- **Vertical Heights**: Never stack two vertical dimension lines within `< 55 px` of each other on the same side — place Overall Height on the left side and Internal Height (or secondary height) on the right side.
- **Units**: Standardise handwritten `cm` values to millimetres (`mm`) for BS 8888 compliance (e.g., `127.5 cm` → `1275 mm`, `350 cm` → `3500 mm`).

## 4. Callout Leader Rules (`callouts[]`)

Each callout object:
```json
{
  "id": "callout-<sku>-<name>",
  "title": "Enclosed Fork Pockets:",
  "detail": "180 mm Wide • 520 Gap • 700 Ctr.",
  "targetX": 604, "targetY": 668,
  "elbowX": 592, "elbowY": 834,
  "boxX": 612, "boxY": 812,
  "color": "amber"
}
```

**CRITICAL — Anchor Side Calculation** (mirrors `scripts/generate-editable-blueprints.mjs`):
- Box width `w = Math.round(Math.max(title.length * 7.6, detail.length * 7.2) + 20)`.
- Box height `h = detail ? 44 : 26`.
- `anchorX = boxX < targetX ? boxX + w : boxX`
- `anchorY = boxY + h / 2`
- **Rule to prevent leader lines doubling back across the text box**:
  - If the box is to the **left** of the target (`boxX < targetX`), ensure `boxX + w <= targetX` and place `elbowX` to the right of `boxX + w` (between the box right edge and the target).
  - If the box is to the **right** of the target (`boxX >= targetX`), place `elbowX` slightly to the left of `boxX` (between the target and `boxX`).
- **Zero Crossings**: Never route a callout leader line across an external dimension line or another callout leader. Use the four natural white-space quadrants (top-left, mid-left, bottom-center, mid-right above the title block).

## 5. ISO Title Block (`titleBlock`)

```json
"titleBlock": {
  "companyName": "STILLAGE STORAGE SOLUTIONS",
  "drawingTitle": "UPPERCASE PRODUCT NAME",
  "sku": "SKU: <SKU>",
  "dimensionsSummary": "EXT: <L> x <W> x <H> MM | TARE: <KG> KG",
  "swlSummary": "INT: <IL> x <IW> x <IH> MM | SWL: <SWL> KG",
  "certificationText": "MADE IN BRITAIN | UKCA CERTIFIED"
}
```
Note: `scripts/generate-editable-blueprints.mjs` renders rows 1–5 (`companyName`, `drawingTitle`, `sku`, `dimensionsSummary`, `certificationText`), so put the most important summary specs (external dims + tare weight or SWL) into `dimensionsSummary`. Keep each row under ~44 characters so it fits cleanly inside the `296 px` title block width.
