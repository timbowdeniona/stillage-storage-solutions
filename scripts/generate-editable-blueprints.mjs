// Multi-Layer Editable CAD Blueprint SVG Generator
// Run with: node scripts/generate-editable-blueprints.mjs
//
// Produces self-contained, layered .SVG files (Figma / Inkscape / Illustrator compatible).
// The SVG canvas uses the exact pixel size of the clean 3D base render (1200 x 896), and the
// render is placed at (0,0) at 1:1 scale, so every annotation coordinate in
// src/data/blueprint-specs.json maps directly onto the steelwork in the render.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SPEC_PATH = path.resolve(process.cwd(), 'src/data/blueprint-specs.json');

export const COLOR_MAP = { primary: '#1C2026', amber: '#B45309', teal: '#00796B' };

export function loadBlueprintSpecs() {
  return JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Shared callout box sizing (mirrors EditableBlueprintStudio.tsx). */
export function calloutBoxSize(c) {
  const w = Math.round(Math.max(c.title.length * 7.6, (c.detail || '').length * 7.2) + 20);
  const h = c.detail ? 44 : 26;
  return { w: c.boxWidth || w, h };
}

/** Shared dimension label placement (mirrors EditableBlueprintStudio.tsx). */
export function dimensionLabelGeometry(d) {
  const midX = (d.x1 + d.x2) / 2;
  const midY = (d.y1 + d.y2) / 2;
  let angle = (Math.atan2(d.y2 - d.y1, d.x2 - d.x1) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  const pillW = Math.round(d.label.length * 7.8 + 16);
  // Label sits on the "above" side of the line by default; "below" flips it across the line.
  const below = d.labelSide === 'below';
  return {
    midX: Math.round(midX),
    midY: Math.round(midY),
    angle: Number(angle.toFixed(1)),
    pillW,
    rectY: below ? 4 : -22,
    textY: below ? 18 : -8,
  };
}

export function buildLayeredBlueprintSvgString(spec, canvas, imageHref) {
  const W = canvas.width;
  const H = canvas.height;
  const zonesX = ['A', 'B', 'C', 'D', 'E', 'F'];
  const zonesY = ['1', '2', '3', '4'];
  const zoneW = (W - 48) / zonesX.length;
  const zoneH = (H - 48) / zonesY.length;

  const dims = spec.dimensions
    .map((d) => {
      const col = COLOR_MAP[d.color || 'primary'];
      const g = dimensionLabelGeometry(d);
      const ext =
        d.extX1 !== undefined
          ? `\n      <line x1="${d.extX1}" y1="${d.extY1}" x2="${d.x1}" y2="${d.y1}" stroke="${col}" stroke-width="1" opacity="0.8" />
      <line x1="${d.extX2}" y1="${d.extY2}" x2="${d.x2}" y2="${d.y2}" stroke="${col}" stroke-width="1" opacity="0.8" />`
          : '';
      return `    <g id="${escapeXml(d.id)}" data-editable="dimension">${ext}
      <line x1="${d.x1}" y1="${d.y1}" x2="${d.x2}" y2="${d.y2}" stroke="${col}" stroke-width="1.4" marker-start="url(#arrow-start)" marker-end="url(#arrow-end)" />
      <g transform="translate(${g.midX} ${g.midY}) rotate(${g.angle})">
        <rect x="${-g.pillW / 2}" y="${g.rectY}" width="${g.pillW}" height="18" fill="#FFFFFF" fill-opacity="0.9" />
        <text x="0" y="${g.textY}" text-anchor="middle" fill="${col}" font-size="14" font-weight="500">${escapeXml(d.label)}</text>
      </g>
    </g>`;
    })
    .join('\n');

  const callouts = spec.callouts
    .map((c) => {
      const col = COLOR_MAP[c.color || 'primary'];
      const { w, h } = calloutBoxSize(c);
      const anchorX = c.boxX < c.targetX ? c.boxX + w : c.boxX;
      const anchorY = c.boxY + h / 2;
      return `    <g id="${escapeXml(c.id)}" data-editable="callout">
      <polyline points="${c.targetX},${c.targetY} ${c.elbowX},${c.elbowY} ${anchorX},${anchorY}" fill="none" stroke="${col}" stroke-width="1.2" marker-start="url(#arrow-end)" />
      <rect x="${c.boxX}" y="${c.boxY}" width="${w}" height="${h}" fill="#FFFFFF" fill-opacity="0.9" />
      <text x="${c.boxX + 8}" y="${c.boxY + 18}" fill="${col}" font-size="15" font-weight="500">${escapeXml(c.title)}</text>${
        c.detail
          ? `\n      <text x="${c.boxX + 8}" y="${c.boxY + 37}" fill="${col}" font-size="15" font-weight="500">${escapeXml(c.detail)}</text>`
          : ''
      }
    </g>`;
    })
    .join('\n');

  const tb = spec.titleBlock;
  const tbX = W - 320;
  const tbY = H - 144;
  const tbRows = [tb.companyName, tb.drawingTitle, tb.sku, tb.dimensionsSummary, tb.certificationText];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Inter, Arial, Helvetica, sans-serif">
  <title>${escapeXml(spec.productTitle)} (${escapeXml(spec.sku)}) — Editable Layered CAD Blueprint</title>
  <desc>Multi-layer editable SVG blueprint. Base render placed 1:1 at (0,0); all dimensions, callouts and the title block are live vector elements on their own layers.</desc>
  <defs>
    <pattern id="cad-grid" width="150" height="150" patternUnits="userSpaceOnUse">
      <path d="M 30 0 V 150 M 60 0 V 150 M 90 0 V 150 M 120 0 V 150 M 0 30 H 150 M 0 60 H 150 M 0 90 H 150 M 0 120 H 150" fill="none" stroke="#E2E8F0" stroke-width="0.6" />
      <path d="M 150 0 H 0 V 150" fill="none" stroke="#CBD5E1" stroke-width="0.9" />
    </pattern>
    <marker id="arrow-start" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="8" markerHeight="8" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 10 1 L 0 5 L 10 9 z" fill="#1C2026" />
    </marker>
    <marker id="arrow-end" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1C2026" />
    </marker>
  </defs>

  <!-- LAYER 1: DRAFTING SHEET, GRID & BORDER -->
  <g id="layer-sheet-grid">
    <rect width="${W}" height="${H}" fill="#F8FAFC" />
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="url(#cad-grid)" />
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#94A3B8" stroke-width="1.5" />
${zonesX.map((z, i) => `    <text x="${Math.round(24 + i * zoneW + zoneW / 2)}" y="17" text-anchor="middle" fill="#94A3B8" font-size="10">${z}</text>`).join('\n')}
${zonesY.map((z, i) => `    <text x="12" y="${Math.round(24 + i * zoneH + zoneH / 2)}" text-anchor="middle" dominant-baseline="middle" fill="#94A3B8" font-size="10">${z}</text>`).join('\n')}
  </g>

  <!-- LAYER 2: CLEAN 3D CAD RENDER (1:1, multiply blend so the white background lets the grid show through) -->
  <g id="layer-3d-cad-subject">
    <image href="${imageHref}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" style="mix-blend-mode:multiply" />
  </g>

  <!-- LAYER 3: EDITABLE DIMENSION LINES -->
  <g id="layer-dimension-lines">
${dims}
  </g>

  <!-- LAYER 4: EDITABLE CALLOUTS -->
  <g id="layer-callouts">
${callouts}
  </g>

  <!-- LAYER 5: EDITABLE TITLE BLOCK -->
  <g id="layer-iso-title-block" transform="translate(${tbX} ${tbY})">
    <rect x="0" y="0" width="296" height="120" fill="#FFFFFF" stroke="#475569" stroke-width="1.2" />
${[24, 48, 72, 96].map((y) => `    <line x1="0" y1="${y}" x2="296" y2="${y}" stroke="#475569" stroke-width="0.8" />`).join('\n')}
${tbRows.map((t, i) => `    <text x="148" y="${i * 24 + 17}" text-anchor="middle" fill="#1C2026" font-size="${i === 0 ? 14 : 12}" font-weight="${i === 0 ? 600 : 500}">${escapeXml(t)}</text>`).join('\n')}
  </g>
</svg>
`;
}

export function generateAllEditableBlueprintSvgs() {
  const { canvas, presets } = loadBlueprintSpecs();
  const outDir = path.resolve(process.cwd(), 'public/images/blueprints');
  fs.mkdirSync(outDir, { recursive: true });

  for (const spec of Object.values(presets)) {
    const imgPath = path.resolve(process.cwd(), 'public', spec.baseRenderUrl.replace(/^\//, ''));
    const base64Uri = `data:image/jpeg;base64,${fs.readFileSync(imgPath).toString('base64')}`;
    const svg = buildLayeredBlueprintSvgString(spec, canvas, base64Uri);
    const outPath = path.join(outDir, spec.fileName);
    fs.writeFileSync(outPath, svg, 'utf8');
    console.log(`Generated editable layered SVG: ${outPath} (${svg.length} bytes)`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  generateAllEditableBlueprintSvgs();
}
