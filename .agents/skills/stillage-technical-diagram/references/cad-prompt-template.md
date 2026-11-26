# Clean 3D CAD Base Render Prompt Template

Use this prompt template when invoking the `image-generator` subagent to create the un-annotated 3D CAD isometric base render for a stillage product.

## Prompt Structure

Fill in the bracketed sections from the verified measurements and workshop photo:

```text
Generate a clean, un-annotated 3D CAD isometric technical render of a [PRODUCT DESCRIPTION, e.g. long heavy-duty steel pipe stillage] ([SKU]) on a 100% pure solid white background (#FFFFFF), formatted in landscape 4:3 aspect ratio.

Exact geometry & visual style:
- Technical 3D CAD shaded isometric illustration style (like SolidWorks/AutoCAD shaded-with-edges): matte RAL 5010 Stillage Blue steel box section (#1E5FA8 to #144B8A shading) with crisp thin dark charcoal edge lines (#1C2026).
- Proportions: [EXTERNAL_L] mm long x [EXTERNAL_W] mm wide x [EXTERNAL_H] mm high (approx [L:W] length-to-width ratio), viewed from a clean 3/4 isometric angle showing all key structural features clearly.
- Stacking feet / base mobility: [e.g., 4 flared pressed-steel pyramid stacking feet at the 4 bottom corners / 4 heavy-duty lockable castors / flat skid base].
- Side walls & posts: [e.g., 4 vertical 50x50mm square box-section posts per long side forming 3 equal open bays / 50x50x4mm welded wire mesh panels with half-drop front gate / solid corrugated steel sheet sides].
- Short ends: [e.g., completely OPEN above the base rail / closed with horizontal rails / demountable corner posts].
- Base deck structure: [e.g., rectangular box-section perimeter frame with transverse crossbars and 1 central longitudinal floor bearer bar / solid 2mm mild steel deck plate].
- Forklift pockets (if present): [e.g., 2 rectangular enclosed box-section forklift guide pockets welded underneath the middle bay running front-to-back, clearly visible under the front bottom rail].
- Composition: Centered in the 4:3 frame with generous pure white margin (~18–22% padding on all sides, and open space at bottom-right for a title block) so technical dimension lines can be overlaid later.
- STRICT NEGATIVE CONSTRAINTS: ZERO text, ZERO numbers, ZERO dimension lines, ZERO arrows, ZERO callouts, ZERO grid lines, ZERO border, ZERO title block, ZERO workshop background, ZERO ground shadow. Strictly the isolated 3D CAD steel stillage on pure #FFFFFF white.
```

## Post-Generation Checklist

Before moving to coordinate extraction, inspect the returned image with `read_file` and verify:
1. **Structural accuracy**: Correct number of posts/bays, open vs closed ends, stacking feet, base bearers, and forklift pockets match the workshop photo.
2. **Cleanliness**: No baked-in text, arrows, dimensions, grid lines, or drop shadows.
3. **Pure white background**: So `mix-blend-mode:multiply` on `#layer-3d-cad-subject` lets the BS 8888 drafting grid show through cleanly.
4. **Margins**: If the subject is too close to the edges (<14% margin), run `./scripts/pad-base-render.sh` to resize and pad onto `1200 × 896` `#FFFFFF`.
