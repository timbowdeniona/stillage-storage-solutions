'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  FileCode2,
  Image as ImageIcon,
  Move,
  Plus,
  RotateCcw,
  Sliders,
  Trash2,
  Type,
} from 'lucide-react';
import {
  BlueprintAnnotationSpec,
  BlueprintCalloutLeader,
  BlueprintDimensionLine,
  Product,
} from '@/types/catalog';
import { BLUEPRINT_CANVAS_SIZE, getBlueprintSpecForProduct } from '@/data/editableBlueprints';

interface EditableBlueprintStudioProps {
  products: Product[];
  initialSku?: string;
  compact?: boolean;
}

type DragHandleState =
  | {
      kind: 'dim-p1' | 'dim-p2' | 'dim-ext1' | 'dim-ext2';
      id: string;
    }
  | {
      kind: 'callout-target' | 'callout-elbow' | 'callout-box';
      id: string;
      offsetX?: number;
      offsetY?: number;
    }
  | null;

const COLOR_MAP: Record<'primary' | 'amber' | 'teal', string> = {
  primary: '#1C2026',
  amber: '#B45309',
  teal: '#00796B',
};

function calloutBoxSize(c: BlueprintCalloutLeader) {
  const w = Math.round(Math.max(c.title.length * 7.6, (c.detail || '').length * 7.2) + 20);
  const h = c.detail ? 44 : 26;
  return { w: c.boxWidth || w, h };
}

function dimensionLabelGeometry(d: BlueprintDimensionLine) {
  const midX = (d.x1 + d.x2) / 2;
  const midY = (d.y1 + d.y2) / 2;
  let angle = (Math.atan2(d.y2 - d.y1, d.x2 - d.x1) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  const pillW = Math.round(d.label.length * 7.8 + 16);
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

export function EditableBlueprintStudio({
  products,
  initialSku,
  compact = false,
}: EditableBlueprintStudioProps) {
  const W = BLUEPRINT_CANVAS_SIZE.width;
  const H = BLUEPRINT_CANVAS_SIZE.height;

  const defaultProduct =
    products.find((p) => p.sku === initialSku) ||
    products.find((p) => p.sku === 'BBFH2-1') ||
    products[0];

  const [selectedSku, setSelectedSku] = useState<string>(defaultProduct?.sku || 'BBFH2-1');
  const activeProduct = products.find((p) => p.sku === selectedSku) || defaultProduct;

  const [spec, setSpec] = useState<BlueprintAnnotationSpec>(() =>
    getBlueprintSpecForProduct(activeProduct)
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    spec.dimensions[0]?.id || null
  );
  const [dragHandle, setDragHandle] = useState<DragHandleState>(null);
  const [showHandles, setShowHandles] = useState<boolean>(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (activeProduct) {
      const nextSpec = getBlueprintSpecForProduct(activeProduct);
      setSpec(nextSpec);
      setSelectedItemId(nextSpec.dimensions[0]?.id || nextSpec.callouts[0]?.id || null);
    }
  }, [selectedSku]);

  const toSvgCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = W / Math.max(1, rect.width);
    const scaleY = H / Math.max(1, rect.height);
    return {
      x: Math.max(26, Math.min(W - 26, Math.round((clientX - rect.left) * scaleX))),
      y: Math.max(26, Math.min(H - 26, Math.round((clientY - rect.top) * scaleY))),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragHandle) return;
    const pt = toSvgCoords(e.clientX, e.clientY);

    if (dragHandle.kind.startsWith('dim-')) {
      setSpec((prev) => ({
        ...prev,
        dimensions: prev.dimensions.map((d) => {
          if (d.id !== dragHandle.id) return d;
          if (dragHandle.kind === 'dim-p1') return { ...d, x1: pt.x, y1: pt.y };
          if (dragHandle.kind === 'dim-p2') return { ...d, x2: pt.x, y2: pt.y };
          if (dragHandle.kind === 'dim-ext1') return { ...d, extX1: pt.x, extY1: pt.y };
          if (dragHandle.kind === 'dim-ext2') return { ...d, extX2: pt.x, extY2: pt.y };
          return d;
        }),
      }));
    } else if (dragHandle.kind.startsWith('callout-')) {
      setSpec((prev) => ({
        ...prev,
        callouts: prev.callouts.map((c) => {
          if (c.id !== dragHandle.id) return c;
          if (dragHandle.kind === 'callout-target') {
            return { ...c, targetX: pt.x, targetY: pt.y };
          }
          if (dragHandle.kind === 'callout-elbow') {
            return { ...c, elbowX: pt.x, elbowY: pt.y };
          }
          if (dragHandle.kind === 'callout-box') {
            return {
              ...c,
              boxX: Math.max(28, Math.min(W - 240, pt.x - (dragHandle.offsetX || 0))),
              boxY: Math.max(28, Math.min(H - 60, pt.y - (dragHandle.offsetY || 0))),
            };
          }
          return c;
        }),
      }));
    }
  };

  const handlePointerUp = () => {
    if (dragHandle) {
      setDragHandle(null);
    }
  };

  const selectedDimension = spec.dimensions.find((d) => d.id === selectedItemId);
  const selectedCallout = spec.callouts.find((c) => c.id === selectedItemId);

  const handleAddDimension = () => {
    const newId = `dim-custom-${Date.now()}`;
    const newDim: BlueprintDimensionLine = {
      id: newId,
      label: '500 mm (Custom)',
      x1: 380,
      y1: 420,
      x2: 680,
      y2: 420,
      extX1: 380,
      extY1: 380,
      extX2: 680,
      extY2: 380,
      color: 'amber',
    };
    setSpec((prev) => ({ ...prev, dimensions: [...prev.dimensions, newDim] }));
    setSelectedItemId(newId);
  };

  const handleAddCallout = () => {
    const newId = `callout-custom-${Date.now()}`;
    const newCallout: BlueprintCalloutLeader = {
      id: newId,
      title: 'Custom Engineering Note:',
      detail: 'Click to edit specification text',
      targetX: 560,
      targetY: 380,
      elbowX: 860,
      elbowY: 220,
      boxX: 900,
      boxY: 198,
      color: 'teal',
    };
    setSpec((prev) => ({ ...prev, callouts: [...prev.callouts, newCallout] }));
    setSelectedItemId(newId);
  };

  const handleDeleteSelected = () => {
    if (!selectedItemId) return;
    setSpec((prev) => ({
      ...prev,
      dimensions: prev.dimensions.filter((d) => d.id !== selectedItemId),
      callouts: prev.callouts.filter((c) => c.id !== selectedItemId),
    }));
    setSelectedItemId(null);
  };

  const handleResetPreset = () => {
    if (!activeProduct) return;
    const reset = getBlueprintSpecForProduct(activeProduct);
    setSpec(reset);
    setSelectedItemId(reset.dimensions[0]?.id || null);
    setExportStatus('Reset to factory 1:1 CAD preset.');
  };

  const fetchImageAsDataUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const buildStandaloneSvgMarkup = async (): Promise<string | null> => {
    if (!svgRef.current) return null;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('[data-editor-handle="true"]').forEach((el) => el.remove());

    const imgEl = clone.querySelector('image');
    if (imgEl) {
      const href = imgEl.getAttribute('href') || spec.baseRenderUrl;
      const dataUrl = await fetchImageAsDataUrl(href);
      imgEl.setAttribute('href', dataUrl);
    }

    const serializer = new XMLSerializer();
    return `<?xml version="1.0" encoding="UTF-8"?>\n${serializer.serializeToString(clone)}`;
  };

  const handleExportEditableSvg = async () => {
    setExportStatus('Preparing self-contained layered SVG...');
    const svgString = await buildStandaloneSvgMarkup();
    if (!svgString) return;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spec.sku.toLowerCase()}-editable-blueprint.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportStatus(
      `Exported ${spec.sku.toLowerCase()}-editable-blueprint.svg (Open in Figma, Inkscape, or Illustrator).`
    );
  };

  const handleExportHighResPng = async () => {
    setExportStatus('Rendering 2400×1792px high-resolution PNG...');
    const svgString = await buildStandaloneSvgMarkup();
    if (!svgString) return;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `${spec.sku.toLowerCase()}-blueprint-2400px.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          setExportStatus(
            `Exported ${spec.sku.toLowerCase()}-blueprint-2400px.png (${W * 2}×${H * 2}px).`
          );
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const zonesX = ['A', 'B', 'C', 'D', 'E', 'F'];
  const zonesY = ['1', '2', '3', '4'];
  const zoneW = (W - 48) / zonesX.length;
  const zoneH = (H - 48) / zonesY.length;
  const tbX = W - 320;
  const tbY = H - 144;
  const tbRows = [
    spec.titleBlock.companyName,
    spec.titleBlock.drawingTitle,
    spec.titleBlock.sku,
    spec.titleBlock.dimensionsSummary,
    spec.titleBlock.certificationText,
  ];

  return (
    <div className="border-2 border-brand-navy bg-surface-white rounded-sm shadow-md overflow-hidden">
      {/* Studio Top Bar */}
      <div className="bg-brand-navy text-surface-white px-4 py-3.5 border-b border-white/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-accent-teal shrink-0" />
          <div>
            <div className="font-display font-bold uppercase tracking-wider text-base">
              Interactive CAD Blueprint Studio — {spec.sku}
            </div>
            <div className="font-mono text-[11px] text-surface-sand">
              1:1 Pixel-Locked Vector Overlay ({W}×{H}) • Click any dimension or callout to edit or
              drag handles
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {!compact && products.length > 1 && (
            <select
              aria-label="Select product blueprint to edit"
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="bg-brand-navyDark text-surface-sand border border-white/25 rounded-sm px-2.5 py-1.5 font-mono text-xs"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.title.slice(0, 38)}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setShowHandles(!showHandles)}
            className={`px-3 py-1.5 rounded-sm border inline-flex items-center gap-1.5 transition-colors ${
              showHandles
                ? 'bg-stillage-blue border-stillage-blueLight text-white font-bold'
                : 'bg-brand-navyDark text-surface-sand border-white/20'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>{showHandles ? 'Handles: ON' : 'Preview Clean'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportEditableSvg}
            className="px-3 py-1.5 rounded-sm border border-accent-teal bg-accent-teal hover:bg-accent-teal/90 text-white font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Export Editable .SVG</span>
          </button>

          <button
            type="button"
            onClick={handleExportHighResPng}
            className="px-3 py-1.5 rounded-sm border border-accent-amber bg-accent-amber hover:bg-accent-amber/90 text-white font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Export High-Res .PNG</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 8 Columns: Interactive 1200x896 SVG Blueprint Sheet */}
        <div className="lg:col-span-8 bg-steel-100 p-3 sm:p-5 border-b lg:border-b-0 lg:border-r border-steel-200">
          <div className="w-full aspect-[1200/896] bg-white shadow-sm border border-steel-200 relative">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              className="w-full h-full block select-none touch-none"
              xmlns="http://www.w3.org/2000/svg"
              fontFamily="Inter, Arial, Helvetica, sans-serif"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <title>
                {spec.productTitle} ({spec.sku}) — Editable Layered CAD Blueprint
              </title>
              <defs>
                <pattern id="studio-cad-grid" width="150" height="150" patternUnits="userSpaceOnUse">
                  <path
                    d="M 30 0 V 150 M 60 0 V 150 M 90 0 V 150 M 120 0 V 150 M 0 30 H 150 M 0 60 H 150 M 0 90 H 150 M 0 120 H 150"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="0.6"
                  />
                  <path
                    d="M 150 0 H 0 V 150"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="0.9"
                  />
                </pattern>
                <marker
                  id="studio-arrow-start"
                  viewBox="0 0 10 10"
                  refX="1"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 10 1 L 0 5 L 10 9 z" fill="#1C2026" />
                </marker>
                <marker
                  id="studio-arrow-end"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#1C2026" />
                </marker>
              </defs>

              {/* LAYER 1: BS 8888 DRAFTING SHEET & GRID */}
              <g id="layer-sheet-grid">
                <rect width={W} height={H} fill="#F8FAFC" />
                <rect x="24" y="24" width={W - 48} height={H - 48} fill="url(#studio-cad-grid)" />
                <rect
                  x="24"
                  y="24"
                  width={W - 48}
                  height={H - 48}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
                {zonesX.map((z, i) => (
                  <text
                    key={`zx-${z}`}
                    x={Math.round(24 + i * zoneW + zoneW / 2)}
                    y="17"
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10"
                  >
                    {z}
                  </text>
                ))}
                {zonesY.map((z, i) => (
                  <text
                    key={`zy-${z}`}
                    x="12"
                    y={Math.round(24 + i * zoneH + zoneH / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#94A3B8"
                    fontSize="10"
                  >
                    {z}
                  </text>
                ))}
              </g>

              {/* LAYER 2: CLEAN 3D CAD ISOMETRIC SUBJECT RENDER (1:1 AT 0,0) */}
              <g id="layer-3d-cad-subject">
                <image
                  href={spec.baseRenderUrl}
                  x="0"
                  y="0"
                  width={W}
                  height={H}
                  preserveAspectRatio="none"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </g>

              {/* LAYER 3: EDITABLE VECTOR DIMENSION LINES */}
              <g id="layer-dimension-lines">
                {spec.dimensions.map((d) => {
                  const strokeHex = COLOR_MAP[d.color || 'primary'];
                  const isSelected = selectedItemId === d.id;
                  const g = dimensionLabelGeometry(d);

                  return (
                    <g
                      key={d.id}
                      id={d.id}
                      data-editable="dimension"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(d.id);
                      }}
                      className="cursor-pointer"
                    >
                      {d.extX1 !== undefined &&
                        d.extY1 !== undefined &&
                        d.extX2 !== undefined &&
                        d.extY2 !== undefined && (
                          <>
                            <line
                              x1={d.extX1}
                              y1={d.extY1}
                              x2={d.x1}
                              y2={d.y1}
                              stroke={strokeHex}
                              strokeWidth="1"
                              opacity="0.8"
                            />
                            <line
                              x1={d.extX2}
                              y1={d.extY2}
                              x2={d.x2}
                              y2={d.y2}
                              stroke={strokeHex}
                              strokeWidth="1"
                              opacity="0.8"
                            />
                          </>
                        )}

                      <line
                        x1={d.x1}
                        y1={d.y1}
                        x2={d.x2}
                        y2={d.y2}
                        stroke={strokeHex}
                        strokeWidth={isSelected ? 2.4 : 1.4}
                        markerStart="url(#studio-arrow-start)"
                        markerEnd="url(#studio-arrow-end)"
                      />

                      <g transform={`translate(${g.midX} ${g.midY}) rotate(${g.angle})`}>
                        <rect
                          x={-g.pillW / 2}
                          y={g.rectY}
                          width={g.pillW}
                          height="18"
                          fill={isSelected ? '#FEF3C7' : '#FFFFFF'}
                          fillOpacity="0.92"
                          stroke={isSelected ? '#145DA0' : 'none'}
                          strokeWidth={isSelected ? 1.5 : 0}
                        />
                        <text
                          x="0"
                          y={g.textY}
                          textAnchor="middle"
                          fill={strokeHex}
                          fontSize="14"
                          fontWeight="500"
                        >
                          {d.label}
                        </text>
                      </g>

                      {showHandles && isSelected && (
                        <g data-editor-handle="true">
                          <circle
                            cx={d.x1}
                            cy={d.y1}
                            r="7"
                            fill="#145DA0"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragHandle({ kind: 'dim-p1', id: d.id });
                            }}
                          />
                          <circle
                            cx={d.x2}
                            cy={d.y2}
                            r="7"
                            fill="#145DA0"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragHandle({ kind: 'dim-p2', id: d.id });
                            }}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* LAYER 4: EDITABLE STRUCTURAL CALLOUTS */}
              <g id="layer-callouts">
                {spec.callouts.map((c) => {
                  const strokeHex = COLOR_MAP[c.color || 'primary'];
                  const isSelected = selectedItemId === c.id;
                  const { w, h } = calloutBoxSize(c);
                  const anchorX = c.boxX < c.targetX ? c.boxX + w : c.boxX;
                  const anchorY = c.boxY + h / 2;

                  return (
                    <g
                      key={c.id}
                      id={c.id}
                      data-editable="callout"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(c.id);
                      }}
                      className="cursor-pointer"
                    >
                      <polyline
                        points={`${c.targetX},${c.targetY} ${c.elbowX},${c.elbowY} ${anchorX},${anchorY}`}
                        fill="none"
                        stroke={strokeHex}
                        strokeWidth={isSelected ? 2 : 1.2}
                        markerStart="url(#studio-arrow-end)"
                      />
                      <rect
                        x={c.boxX}
                        y={c.boxY}
                        width={w}
                        height={h}
                        fill={isSelected ? '#FEF3C7' : '#FFFFFF'}
                        fillOpacity="0.92"
                        stroke={isSelected ? '#145DA0' : 'none'}
                        strokeWidth={isSelected ? 1.5 : 0}
                        onPointerDown={(e) => {
                          if (!showHandles) return;
                          e.stopPropagation();
                          setSelectedItemId(c.id);
                          const pt = toSvgCoords(e.clientX, e.clientY);
                          setDragHandle({
                            kind: 'callout-box',
                            id: c.id,
                            offsetX: pt.x - c.boxX,
                            offsetY: pt.y - c.boxY,
                          });
                        }}
                      />
                      <text
                        x={c.boxX + 8}
                        y={c.boxY + 18}
                        fill={strokeHex}
                        fontSize="15"
                        fontWeight="500"
                        pointerEvents="none"
                      >
                        {c.title}
                      </text>
                      {c.detail && (
                        <text
                          x={c.boxX + 8}
                          y={c.boxY + 37}
                          fill={strokeHex}
                          fontSize="15"
                          fontWeight="500"
                          pointerEvents="none"
                        >
                          {c.detail}
                        </text>
                      )}

                      {showHandles && isSelected && (
                        <g data-editor-handle="true">
                          <circle
                            cx={c.targetX}
                            cy={c.targetY}
                            r="7"
                            fill="#D97706"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragHandle({ kind: 'callout-target', id: c.id });
                            }}
                          />
                          <circle
                            cx={c.elbowX}
                            cy={c.elbowY}
                            r="6"
                            fill="#00897B"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDragHandle({ kind: 'callout-elbow', id: c.id });
                            }}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* LAYER 5: EDITABLE ISO / BS 8888 ENGINEERING TITLE BLOCK */}
              <g id="layer-iso-title-block" transform={`translate(${tbX} ${tbY})`}>
                <rect
                  x="0"
                  y="0"
                  width="296"
                  height="120"
                  fill="#FFFFFF"
                  stroke="#475569"
                  strokeWidth="1.2"
                />
                {[24, 48, 72, 96].map((y) => (
                  <line
                    key={`tb-line-${y}`}
                    x1="0"
                    y1={y}
                    x2="296"
                    y2={y}
                    stroke="#475569"
                    strokeWidth="0.8"
                  />
                ))}
                {tbRows.map((t, i) => (
                  <text
                    key={`tb-row-${i}`}
                    x="148"
                    y={i * 24 + 17}
                    textAnchor="middle"
                    fill="#1C2026"
                    fontSize={i === 0 ? 14 : 12}
                    fontWeight={i === 0 ? 600 : 500}
                  >
                    {t}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          {exportStatus && (
            <div className="mt-2.5 px-3 py-2 bg-brand-navy text-surface-sand font-mono text-xs rounded-sm flex items-center justify-between">
              <span>{exportStatus}</span>
              <button
                type="button"
                onClick={() => setExportStatus(null)}
                className="text-xs underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Right 4 Columns: Inspector & Quick Layer Editor */}
        <div className="lg:col-span-4 p-5 bg-surface-sandLight space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddDimension}
                className="px-3 py-1.5 bg-brand-navy hover:bg-stillage-blue text-white font-mono text-xs font-bold rounded-sm inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Dimension</span>
              </button>
              <button
                type="button"
                onClick={handleAddCallout}
                className="px-3 py-1.5 bg-stillage-blue hover:bg-brand-navy text-white font-mono text-xs font-bold rounded-sm inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Callout</span>
              </button>
              <button
                type="button"
                onClick={handleResetPreset}
                className="ml-auto px-2.5 py-1.5 bg-white border border-steel-200 hover:border-brand-navy text-steel-800 font-mono text-xs rounded-sm inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {selectedDimension ? (
              <div className="bg-white border-2 border-stillage-blue p-4 rounded-sm space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-steel-200 pb-2">
                  <span className="font-display font-bold uppercase text-sm text-brand-navy flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-stillage-blue" />
                    Edit Selected Dimension
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="text-red-600 hover:text-red-800 font-mono text-xs inline-flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-steel-600 mb-1">
                    Measurement Text Label
                  </label>
                  <input
                    type="text"
                    value={selectedDimension.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpec((prev) => ({
                        ...prev,
                        dimensions: prev.dimensions.map((d) =>
                          d.id === selectedDimension.id ? { ...d, label: val } : d
                        ),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-steel-200 rounded-sm font-mono text-xs font-bold text-brand-navy"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['primary', 'amber', 'teal'] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() =>
                        setSpec((prev) => ({
                          ...prev,
                          dimensions: prev.dimensions.map((d) =>
                            d.id === selectedDimension.id ? { ...d, color: col } : d
                          ),
                        }))
                      }
                      className={`py-1.5 px-2 rounded-sm font-mono text-[11px] border capitalize ${
                        (selectedDimension.color || 'primary') === col
                          ? 'border-brand-navy bg-brand-navy text-white font-bold'
                          : 'border-steel-200 bg-surface-sandLight text-steel-800'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedCallout ? (
              <div className="bg-white border-2 border-stillage-blue p-4 rounded-sm space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-steel-200 pb-2">
                  <span className="font-display font-bold uppercase text-sm text-brand-navy flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-stillage-blue" />
                    Edit Selected Callout
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="text-red-600 hover:text-red-800 font-mono text-xs inline-flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-steel-600 mb-1">
                    Line 1 Heading
                  </label>
                  <input
                    type="text"
                    value={selectedCallout.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpec((prev) => ({
                        ...prev,
                        callouts: prev.callouts.map((c) =>
                          c.id === selectedCallout.id ? { ...c, title: val } : c
                        ),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-steel-200 rounded-sm font-mono text-xs font-bold text-brand-navy"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-steel-600 mb-1">
                    Line 2 Specification
                  </label>
                  <input
                    type="text"
                    value={selectedCallout.detail || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpec((prev) => ({
                        ...prev,
                        callouts: prev.callouts.map((c) =>
                          c.id === selectedCallout.id ? { ...c, detail: val } : c
                        ),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-steel-200 rounded-sm font-mono text-xs text-steel-800"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-steel-200 p-4 rounded-sm font-mono text-xs text-steel-600">
                Click any dimension line or engineering callout on the blueprint to edit its text or
                drag its position handles.
              </div>
            )}

            <div className="bg-white border border-steel-200 rounded-sm p-3.5 space-y-2 max-h-60 overflow-y-auto">
              <div className="font-mono text-[11px] font-bold uppercase text-brand-navy">
                Editable Vector Layers ({spec.dimensions.length} Dimensions, {spec.callouts.length}{' '}
                Callouts)
              </div>
              <div className="space-y-1">
                {spec.dimensions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedItemId(d.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-sm font-mono text-xs flex items-center justify-between ${
                      selectedItemId === d.id
                        ? 'bg-stillage-blue text-white font-bold'
                        : 'hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    <span className="truncate">📏 {d.label}</span>
                    <span className="text-[10px] opacity-75">Dim</span>
                  </button>
                ))}
                {spec.callouts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedItemId(c.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-sm font-mono text-xs flex items-center justify-between ${
                      selectedItemId === c.id
                        ? 'bg-stillage-blue text-white font-bold'
                        : 'hover:bg-surface-sandLight text-steel-800'
                    }`}
                  >
                    <span className="truncate">
                      📌 {c.title} {c.detail}
                    </span>
                    <span className="text-[10px] opacity-75">Callout</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-steel-200 rounded-sm p-3.5 space-y-2.5">
              <div className="font-mono text-[11px] font-bold uppercase text-brand-navy">
                ISO Title Block Fields
              </div>
              <input
                type="text"
                aria-label="Title Block Drawing Title"
                value={spec.titleBlock.drawingTitle}
                onChange={(e) =>
                  setSpec((prev) => ({
                    ...prev,
                    titleBlock: { ...prev.titleBlock, drawingTitle: e.target.value },
                  }))
                }
                className="w-full px-2.5 py-1.5 border border-steel-200 rounded-sm font-mono text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  aria-label="Title Block SKU"
                  value={spec.titleBlock.sku}
                  onChange={(e) =>
                    setSpec((prev) => ({
                      ...prev,
                      titleBlock: { ...prev.titleBlock, sku: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-steel-200 rounded-sm font-mono text-xs"
                />
                <input
                  type="text"
                  aria-label="Title Block Dimensions Summary"
                  value={spec.titleBlock.dimensionsSummary}
                  onChange={(e) =>
                    setSpec((prev) => ({
                      ...prev,
                      titleBlock: { ...prev.titleBlock, dimensionsSummary: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-steel-200 rounded-sm font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-steel-200 text-[11px] font-mono text-steel-600 space-y-1.5">
            <div className="font-bold text-brand-navy">
              Compatible Desktop &amp; Web Vector Tools:
            </div>
            <div>
              Open exported <code className="text-brand-navy font-bold">.svg</code> files directly
              in <strong>Figma</strong> (free), <strong>Inkscape</strong> (free), or{' '}
              <strong>Adobe Illustrator</strong> with all 5 CAD layers preserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
