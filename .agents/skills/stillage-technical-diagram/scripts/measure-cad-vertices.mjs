#!/usr/bin/env node
// Extract 1-pixel accurate CAD vertex & contour coordinates from a 1200x896 pure-white base render.
// Zero external dependencies (uses macOS `sips` to convert to uncompressed BMP and scans RGB bytes).
// Usage: node measure-cad-vertices.mjs <path-to-1200x896-base-render.jpg>

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node measure-cad-vertices.mjs <base-render.jpg>');
  process.exit(1);
}

const absInput = path.resolve(inputPath);
const tmpBmp = `/tmp/measure-cad-${process.pid}.bmp`;

try {
  execFileSync('sips', ['-s', 'format', 'bmp', absInput, '--out', tmpBmp], { stdio: 'pipe' });
  const buf = fs.readFileSync(tmpBmp);

  const offset = buf.readUInt32LE(10);
  const w = buf.readInt32LE(18);
  const rawH = buf.readInt32LE(22);
  const h = Math.abs(rawH);
  const topDown = rawH < 0;
  const bpp = buf.readUInt16LE(28);
  const rowSize = Math.floor((bpp * w + 31) / 32) * 4;
  const bytesPerPx = bpp / 8;

  const isSubject = (x, y) => {
    const row = topDown ? y : h - 1 - y;
    const idx = offset + row * rowSize + x * bytesPerPx;
    const b = buf[idx];
    const g = buf[idx + 1];
    const r = buf[idx + 2];
    return r + g + b < 660;
  };

  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;
  let topPt = null;
  let bottomPt = null;
  let leftPt = null;
  let rightPt = null;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isSubject(x, y)) {
        if (x < minX) { minX = x; leftPt = [x, y]; }
        if (x > maxX) { maxX = x; rightPt = [x, y]; }
        if (y < minY) { minY = y; topPt = [x, y]; }
        if (y > maxY) { maxY = y; bottomPt = [x, y]; }
      }
    }
  }

  // Sample top and bottom silhouette contours every 20px across the subject width
  const topContour = [];
  const bottomContour = [];
  for (let x = minX; x <= maxX; x += 20) {
    let firstY = null;
    let lastY = null;
    for (let y = minY; y <= maxY; y++) {
      if (isSubject(x, y)) {
        if (firstY === null) firstY = y;
        lastY = y;
      }
    }
    if (firstY !== null) {
      topContour.push(`${x}:${firstY}`);
      bottomContour.push(`${x}:${lastY}`);
    }
  }

  // Detect local extrema (feet / pockets along bottom, post tops along top)
  const bottomMaxYByX = new Array(w).fill(0);
  const topMinYByX = new Array(w).fill(h);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (isSubject(x, y)) {
        if (y < topMinYByX[x]) topMinYByX[x] = y;
        if (y > bottomMaxYByX[x]) bottomMaxYByX[x] = y;
      }
    }
  }

  const bottomPeaks = [];
  const topPeaks = [];
  const windowPx = 22;
  for (let x = minX + 5; x <= maxX - 5; x++) {
    const by = bottomMaxYByX[x];
    if (by > 0) {
      let isPeak = true;
      for (let dx = -windowPx; dx <= windowPx; dx++) {
        if (dx !== 0 && bottomMaxYByX[x + dx] > by) { isPeak = false; break; }
      }
      if (isPeak && (!bottomPeaks.length || x - bottomPeaks[bottomPeaks.length - 1][0] > 35)) {
        bottomPeaks.push([x, by]);
      }
    }
    const ty = topMinYByX[x];
    if (ty < h) {
      let isPeak = true;
      for (let dx = -windowPx; dx <= windowPx; dx++) {
        if (dx !== 0 && topMinYByX[x + dx] < ty) { isPeak = false; break; }
      }
      if (isPeak && (!topPeaks.length || x - topPeaks[topPeaks.length - 1][0] > 35)) {
        topPeaks.push([x, ty]);
      }
    }
  }

  const result = {
    canvas: { width: w, height: h },
    bounds: { minX, maxX, minY, maxY },
    extremes: { topPt, bottomPt, leftPt, rightPt },
    detectedTopPeaks: topPeaks,
    detectedBottomPeaks: bottomPeaks,
    topContour: topContour.join(' '),
    bottomContour: bottomContour.join(' '),
  };

  console.log(JSON.stringify(result, null, 2));
} finally {
  if (fs.existsSync(tmpBmp)) fs.unlinkSync(tmpBmp);
}
