'use client';

import React, { useId, useRef, useState } from 'react';
import { Compass, Download, Eye, Layers, Maximize2, Ruler } from 'lucide-react';
import { Product } from '@/types/catalog';

export interface ProductTechnicalDiagramProps {
  product: Product;
  finishCode?: string;
  finishName?: string;
  finishSwatchHex?: string;
  mobilityName?: string;
  compact?: boolean;
}

export function ProductTechnicalDiagram({
  product,
  finishCode,
  finishName,
  finishSwatchHex = '#145DA0',
  mobilityName = 'Standard Pressed Steel Stacking Feet',
  compact = false,
}: ProductTechnicalDiagramProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const instanceId = useId().replace(/:/g, '');
  const titleId = `cad-title-${instanceId}`;
  const descId = `cad-desc-${instanceId}`;

  const [cadTheme, setCadTheme] = useState<'blueprint-dark' | 'drafting-light'>('blueprint-dark');
  const [showDualUnits, setShowDualUnits] = useState<boolean>(false);
  const [showCallouts, setShowCallouts] = useState<boolean>(true);

  const activeFinishCode = finishCode || 'RAL 5010';
  const activeFinishName = finishName || product.standardFinish || 'RAL 5010 Stillage Blue';

  // Calculate proportional orthographic top-down plan dimensions
  const maxPlanWidth = 210;
  const maxPlanHeight = 135;
  const aspect = product.externalLengthMm / Math.max(1, product.externalWidthMm);

  let planW = maxPlanWidth;
  let planH = Math.round(maxPlanWidth / aspect);
  if (planH > maxPlanHeight) {
    planH = maxPlanHeight;
    planW = Math.round(maxPlanHeight * aspect);
  }
  planW = Math.max(80, Math.min(maxPlanWidth, planW));
  planH = Math.max(60, Math.min(maxPlanHeight, planH));

  const planCenterX = 835;
  const planCenterY = 215;
  const planX = Math.round(planCenterX - planW / 2);
  const planY = Math.round(planCenterY - planH / 2);

  const footprintSqM = (
    (product.externalLengthMm * product.externalWidthMm) /
    1_000_000
  ).toFixed(2);
  const cubicVolumeM3 = (
    (product.externalLengthMm * product.externalWidthMm * product.externalHeightMm) /
    1_000_000_000
  ).toFixed(2);

  const formatMm = (mm: number) => {
    if (!showDualUnits) return `${mm} mm`;
    const inches = (mm / 25.4).toFixed(1);
    return `${mm} mm (${inches}")`;
  };

  const formatKg = (kg: number) => {
    if (!showDualUnits) return `${kg.toLocaleString('en-GB')} kg`;
    const lbs = Math.round(kg * 2.20462).toLocaleString('en-GB');
    return `${kg.toLocaleString('en-GB')} kg (${lbs} lb)`;
  };

  // Palette based on theme
  const isDark = cadTheme === 'blueprint-dark';
  const bgPrimary = isDark ? '#09172C' : '#F8FAFC';
  const bgStage = isDark ? '#0F2342' : '#FFFFFF';
  const bgPanel = isDark ? '#0B1B34' : '#F1F5F9';
  const gridMinor = isDark ? 'rgba(33, 118, 199, 0.16)' : 'rgba(20, 93, 160, 0.09)';
  const gridMajor = isDark ? 'rgba(33, 118, 199, 0.32)' : 'rgba(20, 93, 160, 0.2)';
  const borderStroke = isDark ? '#2176C7' : '#0F2342';
  const dimColor = isDark ? '#38BDF8' : '#145DA0';
  const accentAmber = isDark ? '#FBBF24' : '#D97706';
  const accentTeal = isDark ? '#2DD4BF' : '#00897B';
  const textPrimary = isDark ? '#FFFFFF' : '#0F2342';
  const textSecondary = isDark ? '#E2E8F0' : '#1C2026';
  const textMuted = isDark ? '#94A3B8' : '#4A525D';
  const pillBg = isDark ? '#09172C' : '#FFFFFF';

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const clonedSvg = svgRef.current.cloneNode(true) as SVGSVGElement;
    // Resolve relative image href to absolute origin URL so standalone SVG renders image when opened locally
    const imgEl = clonedSvg.querySelector('image');
    if (imgEl && typeof window !== 'undefined') {
      const href = imgEl.getAttribute('href') || '';
      if (href.startsWith('/')) {
        imgEl.setAttribute('href', `${window.location.origin}${href}`);
      }
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(clonedSvg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.sku}-technical-diagram.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gridZonesX = ['A', 'B', 'C', 'D', 'E', 'F'];
  const gridZonesY = ['1', '2', '3', '4'];

  return (
    <figure
      className="border border-steel-200 bg-surface-white rounded-sm shadow-sm overflow-hidden"
      aria-labelledby={titleId}
    >
      {/* Top CAD Toolbar */}
      <div className="px-4 py-3 bg-brand-navy text-surface-white border-b border-white/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-accent-teal shrink-0" aria-hidden="true" />
          <div>
            <span className="font-display font-bold uppercase tracking-wider text-sm text-surface-white">
              CAD Dimensional Blueprint — {product.sku}
            </span>
            <span className="hidden sm:inline-block ml-2.5 font-mono text-[11px] text-surface-sand">
              {product.externalLengthMm}(L) × {product.externalWidthMm}(W) ×{' '}
              {product.externalHeightMm}(H) mm • {product.swlKg} kg SWL
            </span>
          </div>
        </div>

        {/* Interactive Diagram Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            type="button"
            aria-pressed={cadTheme === 'blueprint-dark'}
            onClick={() =>
              setCadTheme(cadTheme === 'blueprint-dark' ? 'drafting-light' : 'blueprint-dark')
            }
            className={`px-2.5 py-1 rounded-sm border inline-flex items-center gap-1.5 transition-colors ${
              cadTheme === 'blueprint-dark'
                ? 'bg-stillage-blue border-stillage-blueLight text-white font-bold'
                : 'bg-surface-sand text-brand-navy border-surface-sandDark font-bold'
            }`}
          >
            <Layers className="w-3 h-3" aria-hidden="true" />
            <span>{cadTheme === 'blueprint-dark' ? 'Dark Blueprint' : 'Light Drafting'}</span>
          </button>

          <button
            type="button"
            aria-pressed={showDualUnits}
            onClick={() => setShowDualUnits(!showDualUnits)}
            className={`px-2.5 py-1 rounded-sm border inline-flex items-center gap-1.5 transition-colors ${
              showDualUnits
                ? 'bg-accent-amber text-white border-accent-amber font-bold'
                : 'bg-brand-navyDark text-surface-sand border-white/20 hover:border-white/40'
            }`}
          >
            <Ruler className="w-3 h-3" aria-hidden="true" />
            <span>{showDualUnits ? 'mm + inches' : 'Metric (mm)'}</span>
          </button>

          <button
            type="button"
            aria-pressed={showCallouts}
            onClick={() => setShowCallouts(!showCallouts)}
            className={`px-2.5 py-1 rounded-sm border inline-flex items-center gap-1.5 transition-colors ${
              showCallouts
                ? 'bg-brand-navyLight text-white border-white/30 font-bold'
                : 'bg-brand-navyDark text-steel-400 border-white/15'
            }`}
          >
            <Eye className="w-3 h-3" aria-hidden="true" />
            <span>Callouts</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="px-2.5 py-1 rounded-sm border border-accent-teal bg-accent-teal/20 hover:bg-accent-teal text-white font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3 h-3" aria-hidden="true" />
            <span>Export SVG</span>
          </button>

          <a
            href={`/blueprint-studio?sku=${encodeURIComponent(product.sku)}`}
            className="px-2.5 py-1 rounded-sm border border-accent-amber bg-accent-amber hover:bg-accent-amber/90 text-white font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Maximize2 className="w-3 h-3" aria-hidden="true" />
            <span>Edit in Blueprint Studio</span>
          </a>
        </div>
      </div>

      {/* Responsive Aspect-Ratio Reserved Stage for Zero CLS */}
      <div className={`w-full ${compact ? 'aspect-[16/11]' : 'aspect-[16/10]'} relative`}>
        <svg
          ref={svgRef}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          viewBox="0 0 1000 625"
          className="w-full h-full block select-none"
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="JetBrains Mono, SFMono-Regular, Consolas, monospace"
        >
          <title id={titleId}>
            Technical engineering diagram for {product.title} ({product.sku}) showing external
            dimensions {product.externalLengthMm}mm length by {product.externalWidthMm}mm width by{' '}
            {product.externalHeightMm}mm height, rated to {product.swlKg}kg SWL.
          </title>
          <desc id={descId}>
            BS 8888 style CAD blueprint overlaying the primary product elevation image with
            external length, width, and height leader lines, top-down orthographic footprint plan
            ({footprintSqM} square metres), steel section specification ({product.steelSpecification}
            ), and ISO engineering title block.
          </desc>

          <defs>
            {/* Minor & Major CAD Grid Patterns */}
            <pattern id={`cad-grid-${instanceId}`} width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 20 100 M 40 0 L 40 100 M 60 0 L 60 100 M 80 0 L 80 100 M 0 20 L 100 20 M 0 40 L 100 40 M 0 60 L 100 60 M 0 80 L 100 80"
                fill="none"
                stroke={gridMinor}
                strokeWidth="1"
              />
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke={gridMajor}
                strokeWidth="1.25"
              />
            </pattern>

            {/* Dimension Arrowhead Markers */}
            <marker
              id={`arrow-start-${instanceId}`}
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 10 1 L 1 5 L 10 9 z" fill={dimColor} />
            </marker>
            <marker
              id={`arrow-end-${instanceId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill={dimColor} />
            </marker>

            {/* Amber Arrowhead for Width / Depth */}
            <marker
              id={`arrow-amber-start-${instanceId}`}
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 10 1 L 1 5 L 10 9 z" fill={accentAmber} />
            </marker>
            <marker
              id={`arrow-amber-end-${instanceId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accentAmber} />
            </marker>

            {/* Soft drop shadow for primary image */}
            <filter id={`stage-shadow-${instanceId}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity={isDark ? '0.45' : '0.18'} />
            </filter>
          </defs>

          {/* Outer Drawing Sheet Background */}
          <rect width="1000" height="625" fill={bgPrimary} />

          {/* Inner CAD Border Frame */}
          <rect
            x="24"
            y="24"
            width="952"
            height="577"
            fill={bgStage}
            stroke={borderStroke}
            strokeWidth="2"
          />
          <rect
            x="24"
            y="24"
            width="952"
            height="476"
            fill={`url(#cad-grid-${instanceId})`}
          />

          {/* Coordinate Zone Labels (A-F along top, 1-4 along left) */}
          {gridZonesX.map((zone, idx) => {
            const xPos = 24 + idx * 158 + 79;
            return (
              <g key={`zone-x-${zone}`}>
                <text
                  x={xPos}
                  y="17"
                  textAnchor="middle"
                  fill={textMuted}
                  fontSize="10"
                  fontWeight="700"
                >
                  {zone}
                </text>
                {idx > 0 && (
                  <line
                    x1={24 + idx * 158}
                    y1="18"
                    x2={24 + idx * 158}
                    y2="24"
                    stroke={borderStroke}
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          {gridZonesY.map((zone, idx) => {
            const yPos = 24 + idx * 119 + 60;
            return (
              <g key={`zone-y-${zone}`}>
                <text
                  x="12"
                  y={yPos}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textMuted}
                  fontSize="10"
                  fontWeight="700"
                >
                  {zone}
                </text>
                {idx > 0 && (
                  <line
                    x1="18"
                    y1={24 + idx * 119}
                    x2="24"
                    y2={24 + idx * 119}
                    stroke={borderStroke}
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          {/* ============================================================== */}
          {/* LEFT / MAIN STAGE: PRIMARY PRODUCT ELEVATION & DIMENSION LINES */}
          {/* ============================================================== */}

          {/* Stage Header Label */}
          <g transform="translate(42, 42)">
            <rect
              x="0"
              y="0"
              width="275"
              height="26"
              rx="2"
              fill={bgPanel}
              stroke={borderStroke}
              strokeWidth="1"
            />
            <text x="10" y="17" fill={textPrimary} fontSize="11" fontWeight="700">
              VIEW A: ISOMETRIC ELEVATION ({product.sku})
            </text>
          </g>

          {/* Subtle Reference Bounding Box Around Product Subject */}
          <rect
            x="160"
            y="84"
            width="430"
            height="310"
            fill={isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(242, 227, 206, 0.25)'}
            stroke={borderStroke}
            strokeWidth="1"
            strokeDasharray="6 4"
            rx="4"
          />

          {/* Center Crosshair Fiducials */}
          <line
            x1="375"
            y1="72"
            x2="375"
            y2="406"
            stroke={gridMajor}
            strokeWidth="1"
            strokeDasharray="3 6"
          />
          <line
            x1="148"
            y1="239"
            x2="602"
            y2="239"
            stroke={gridMajor}
            strokeWidth="1"
            strokeDasharray="3 6"
          />

          {/* Primary Product Image Cutout */}
          <image
            href={product.primaryImage}
            x="180"
            y="96"
            width="390"
            height="286"
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#stage-shadow-${instanceId})`}
          />

          {/* 1. VERTICAL HEIGHT (H) DIMENSION LEADER (LEFT SIDE) */}
          <g>
            {/* Top & Bottom Horizontal Extension Lines */}
            <line
              x1="92"
              y1="84"
              x2="160"
              y2="84"
              stroke={dimColor}
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
            <line
              x1="92"
              y1="394"
              x2="160"
              y2="394"
              stroke={dimColor}
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
            {/* Vertical Double-Arrow Leader Line */}
            <line
              x1="106"
              y1="88"
              x2="106"
              y2="390"
              stroke={dimColor}
              strokeWidth="2"
              markerStart={`url(#arrow-start-${instanceId})`}
              markerEnd={`url(#arrow-end-${instanceId})`}
            />
            {/* Height Pill Badge */}
            <rect
              x="44"
              y="213"
              width="124"
              height="50"
              rx="3"
              fill={pillBg}
              stroke={dimColor}
              strokeWidth="1.5"
            />
            <text
              x="106"
              y="232"
              textAnchor="middle"
              fill={textMuted}
              fontSize="9.5"
              fontWeight="700"
            >
              OVERALL HEIGHT (H)
            </text>
            <text
              x="106"
              y="251"
              textAnchor="middle"
              fill={dimColor}
              fontSize="12.5"
              fontWeight="700"
            >
              {formatMm(product.externalHeightMm)}
            </text>
          </g>

          {/* 2. HORIZONTAL LENGTH (L) DIMENSION LEADER (BOTTOM) */}
          <g>
            {/* Left & Right Vertical Extension Lines */}
            <line
              x1="160"
              y1="394"
              x2="160"
              y2="452"
              stroke={dimColor}
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
            <line
              x1="590"
              y1="394"
              x2="590"
              y2="452"
              stroke={dimColor}
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
            {/* Horizontal Double-Arrow Leader Line */}
            <line
              x1="164"
              y1="440"
              x2="586"
              y2="440"
              stroke={dimColor}
              strokeWidth="2"
              markerStart={`url(#arrow-start-${instanceId})`}
              markerEnd={`url(#arrow-end-${instanceId})`}
            />
            {/* Length Pill Badge */}
            <rect
              x="290"
              y="416"
              width="170"
              height="46"
              rx="3"
              fill={pillBg}
              stroke={dimColor}
              strokeWidth="1.5"
            />
            <text
              x="375"
              y="434"
              textAnchor="middle"
              fill={textMuted}
              fontSize="9.5"
              fontWeight="700"
            >
              EXTERNAL LENGTH (L)
            </text>
            <text
              x="375"
              y="452"
              textAnchor="middle"
              fill={dimColor}
              fontSize="13"
              fontWeight="700"
            >
              {formatMm(product.externalLengthMm)}
            </text>
          </g>

          {/* 3. ISOMETRIC DEPTH / WIDTH (W) DIMENSION LEADER (BOTTOM RIGHT OBLIQUE) */}
          <g>
            <line
              x1="590"
              y1="394"
              x2="652"
              y2="344"
              stroke={accentAmber}
              strokeWidth="2"
              markerStart={`url(#arrow-amber-start-${instanceId})`}
              markerEnd={`url(#arrow-amber-end-${instanceId})`}
            />
            <rect
              x="546"
              y="420"
              width="142"
              height="44"
              rx="3"
              fill={pillBg}
              stroke={accentAmber}
              strokeWidth="1.5"
            />
            <text
              x="617"
              y="437"
              textAnchor="middle"
              fill={textMuted}
              fontSize="9.5"
              fontWeight="700"
            >
              EXTERNAL WIDTH (W)
            </text>
            <text
              x="617"
              y="454"
              textAnchor="middle"
              fill={accentAmber}
              fontSize="12.5"
              fontWeight="700"
            >
              {formatMm(product.externalWidthMm)}
            </text>
            <line
              x1="617"
              y1="420"
              x2="622"
              y2="369"
              stroke={accentAmber}
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </g>

          {/* 4. STRUCTURAL ENGINEERING CALLOUTS (TOGGLEABLE) */}
          {showCallouts && (
            <g>
              {/* Callout 1: Steel Box Section Gauge (Top Left-Right Leader) */}
              <g>
                <circle cx="265" cy="145" r="5" fill={accentTeal} />
                <polyline
                  points="265,145 310,62 340,62"
                  fill="none"
                  stroke={accentTeal}
                  strokeWidth="1.5"
                />
                <rect
                  x="340"
                  y="42"
                  width="328"
                  height="38"
                  rx="3"
                  fill={pillBg}
                  stroke={accentTeal}
                  strokeWidth="1.25"
                />
                <text x="352" y="57" fill={accentTeal} fontSize="9.5" fontWeight="700">
                  ① STEEL SECTION SPECIFICATION (BS EN 10219)
                </text>
                <text x="352" y="72" fill={textPrimary} fontSize="11" fontWeight="700">
                  {product.steelSpecification}
                </text>
              </g>

              {/* Callout 2: Safe Working Load Badge (Top Right of Stage) */}
              <g>
                <circle cx="465" cy="215" r="5" fill={accentAmber} />
                <polyline
                  points="465,215 535,145 555,145"
                  fill="none"
                  stroke={accentAmber}
                  strokeWidth="1.5"
                />
                <rect
                  x="510"
                  y="95"
                  width="172"
                  height="48"
                  rx="3"
                  fill={pillBg}
                  stroke={accentAmber}
                  strokeWidth="1.5"
                />
                <text x="522" y="113" fill={accentAmber} fontSize="9.5" fontWeight="700">
                  ② SAFE WORKING LOAD
                </text>
                <text x="522" y="132" fill={textPrimary} fontSize="13" fontWeight="700">
                  {formatKg(product.swlKg)} UDL
                </text>
              </g>

              {/* Callout 3: Stacking & Mobility Footing (Bottom Left of Product) */}
              <g>
                <circle cx="245" cy="355" r="5" fill={dimColor} />
                <polyline
                  points="245,355 190,382 145,382"
                  fill="none"
                  stroke={dimColor}
                  strokeWidth="1.5"
                />
                <rect
                  x="42"
                  y="466"
                  width="235"
                  height="26"
                  rx="2"
                  fill={pillBg}
                  stroke={borderStroke}
                  strokeWidth="1"
                />
                <text x="52" y="483" fill={textSecondary} fontSize="10" fontWeight="700">
                  ③ STACKING: {product.stackableHeight.toUpperCase()}
                </text>
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* RIGHT PANEL: PROPORTIONAL TOP-DOWN ORTHOGRAPHIC FOOTPRINT PLAN */}
          {/* ============================================================== */}
          <line
            x1="696"
            y1="24"
            x2="696"
            y2="500"
            stroke={borderStroke}
            strokeWidth="1.5"
          />

          {/* View B Header */}
          <g transform="translate(712, 42)">
            <rect
              x="0"
              y="0"
              width="248"
              height="26"
              rx="2"
              fill={bgPanel}
              stroke={borderStroke}
              strokeWidth="1"
            />
            <text x="10" y="17" fill={textPrimary} fontSize="11" fontWeight="700">
              VIEW B: ORTHOGRAPHIC PLAN (L×W)
            </text>
          </g>

          {/* Proportional Top-Down Plan Drawing */}
          <g>
            {/* Outer Steel Perimeter Frame */}
            <rect
              x={planX}
              y={planY}
              width={planW}
              height={planH}
              fill={isDark ? 'rgba(20, 93, 160, 0.22)' : 'rgba(20, 93, 160, 0.1)'}
              stroke={dimColor}
              strokeWidth="2.5"
            />

            {/* Internal Crossbearer Channels */}
            <line
              x1={planX + Math.round(planW * 0.28)}
              y1={planY}
              x2={planX + Math.round(planW * 0.28)}
              y2={planY + planH}
              stroke={dimColor}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <line
              x1={planX + Math.round(planW * 0.72)}
              y1={planY}
              x2={planX + Math.round(planW * 0.72)}
              y2={planY + planH}
              stroke={dimColor}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <line
              x1={planX}
              y1={planCenterY}
              x2={planX + planW}
              y2={planCenterY}
              stroke={gridMajor}
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* 4 Corner Stanchion / Stacking Cup Squares */}
            {[
              [planX - 4, planY - 4],
              [planX + planW - 8, planY - 4],
              [planX - 4, planY + planH - 8],
              [planX + planW - 8, planY + planH - 8],
            ].map(([cx, cy], idx) => (
              <rect
                key={`corner-post-${idx}`}
                x={cx}
                y={cy}
                width="12"
                height="12"
                fill={accentAmber}
                stroke={bgPrimary}
                strokeWidth="1.5"
              />
            ))}

            {/* Plan View Length Label (Top of Plan Rectangle) */}
            <text
              x={planCenterX}
              y={planY - 12}
              textAnchor="middle"
              fill={dimColor}
              fontSize="11"
              fontWeight="700"
            >
              L: {product.externalLengthMm} mm
            </text>

            {/* Plan View Width Label (Right of Plan Rectangle) */}
            <text
              x={planX + planW + 10}
              y={planCenterY + 4}
              fill={accentAmber}
              fontSize="10.5"
              fontWeight="700"
            >
              W: {product.externalWidthMm}
            </text>

            {/* Center Footprint Area Readout */}
            <rect
              x={planCenterX - 46}
              y={planCenterY - 14}
              width="92"
              height="28"
              rx="2"
              fill={pillBg}
              stroke={borderStroke}
              strokeWidth="1"
            />
            <text
              x={planCenterX}
              y={planCenterY - 1}
              textAnchor="middle"
              fill={textPrimary}
              fontSize="10"
              fontWeight="700"
            >
              {footprintSqM} m² AREA
            </text>
            <text
              x={planCenterX}
              y={planCenterY + 10}
              textAnchor="middle"
              fill={textMuted}
              fontSize="8.5"
            >
              {cubicVolumeM3} m³ VOL
            </text>

            {/* 4-Way Forklift Entry Arrows Indicator */}
            <text
              x={planCenterX}
              y={planY + planH + 22}
              textAnchor="middle"
              fill={accentTeal}
              fontSize="9.5"
              fontWeight="700"
            >
              ▲ 4-WAY FORKLIFT TINE ENTRY ▲
            </text>
          </g>

          {/* Engineering Quick-Spec Summary Box (Bottom Right Panel) */}
          <g transform="translate(712, 330)">
            <rect
              x="0"
              y="0"
              width="248"
              height="156"
              rx="3"
              fill={pillBg}
              stroke={borderStroke}
              strokeWidth="1.25"
            />
            <rect
              x="0"
              y="0"
              width="248"
              height="24"
              fill={bgPanel}
            />
            <text x="10" y="16" fill={textPrimary} fontSize="10" fontWeight="700">
              CAD SPECIFICATION TELEMETRY
            </text>

            {/* Row 1: Tare Weight */}
            <text x="10" y="44" fill={textMuted} fontSize="9.5">
              UNLADEN TARE MASS:
            </text>
            <text x="238" y="44" textAnchor="end" fill={textPrimary} fontSize="10.5" fontWeight="700">
              {formatKg(product.unitWeightKg)}
            </text>
            <line x1="10" y1="52" x2="238" y2="52" stroke={gridMajor} strokeWidth="1" />

            {/* Row 2: SWL to Weight Ratio */}
            <text x="10" y="70" fill={textMuted} fontSize="9.5">
              SWL PAYLOAD RATIO:
            </text>
            <text x="238" y="70" textAnchor="end" fill={accentTeal} fontSize="10.5" fontWeight="700">
              {(product.swlKg / Math.max(1, product.unitWeightKg)).toFixed(1)}:1 SAFETY RATED
            </text>
            <line x1="10" y1="78" x2="238" y2="78" stroke={gridMajor} strokeWidth="1" />

            {/* Row 3: Active Finish Swatch */}
            <text x="10" y="96" fill={textMuted} fontSize="9.5">
              COATING SPEC:
            </text>
            <circle
              cx="145"
              cy="92"
              r="5"
              fill={finishSwatchHex}
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            <text x="238" y="96" textAnchor="end" fill={textPrimary} fontSize="10" fontWeight="700">
              {activeFinishCode}
            </text>
            <line x1="10" y1="104" x2="238" y2="104" stroke={gridMajor} strokeWidth="1" />

            {/* Row 4: Base Footing */}
            <text x="10" y="122" fill={textMuted} fontSize="9.5">
              BASE CONFIG:
            </text>
            <text x="10" y="138" fill={textSecondary} fontSize="9.5" fontWeight="700">
              {mobilityName.length > 34 ? `${mobilityName.slice(0, 34)}…` : mobilityName}
            </text>
          </g>

          {/* ============================================================== */}
          {/* BOTTOM BS 8888 / ISO 7200 ENGINEERING TITLE BLOCK              */}
          {/* ============================================================== */}
          <g transform="translate(24, 500)">
            <rect
              x="0"
              y="0"
              width="952"
              height="101"
              fill={bgPanel}
              stroke={borderStroke}
              strokeWidth="2"
            />

            {/* Vertical Dividers */}
            <line x1="280" y1="0" x2="280" y2="101" stroke={borderStroke} strokeWidth="1.5" />
            <line x1="620" y1="0" x2="620" y2="101" stroke={borderStroke} strokeWidth="1.5" />
            <line x1="805" y1="0" x2="805" y2="101" stroke={borderStroke} strokeWidth="1.5" />

            {/* Horizontal Divider inside right columns */}
            <line x1="280" y1="50" x2="952" y2="50" stroke={borderStroke} strokeWidth="1" />

            {/* Column 1: Manufacturer & Regulatory Authority */}
            <text x="16" y="24" fill={textPrimary} fontSize="13" fontWeight="800" letterSpacing="0.8">
              STILLAGE STORAGE SOLUTIONS
            </text>
            <text x="16" y="42" fill={dimColor} fontSize="10" fontWeight="700">
              UK INDUSTRIAL STEEL FABRICATION DIVISION
            </text>
            <text x="16" y="64" fill={textMuted} fontSize="9.5">
              STANDARD: BS EN 10219 S275JR • PUWER 1998
            </text>
            <text x="16" y="82" fill={accentTeal} fontSize="10" fontWeight="700">
              ✓ {product.ukcaCertified ? 'UKCA CERTIFIED & SWL LOAD TESTED' : 'INDUSTRIAL GRADE QC'}
            </text>

            {/* Column 2 Top: Component Title */}
            <text x="294" y="18" fill={textMuted} fontSize="9" fontWeight="700">
              COMPONENT DESCRIPTION / TITLE
            </text>
            <text x="294" y="37" fill={textPrimary} fontSize="11.5" fontWeight="700">
              {product.title.length > 46 ? `${product.title.slice(0, 46)}…` : product.title}
            </text>

            {/* Column 2 Bottom: External Dimensions & Finish */}
            <text x="294" y="67" fill={textMuted} fontSize="9" fontWeight="700">
              NOMINAL EXTERNAL ENVELOPE (L × W × H) &amp; FINISH
            </text>
            <text x="294" y="86" fill={textSecondary} fontSize="11" fontWeight="700">
              {product.externalLengthMm} × {product.externalWidthMm} × {product.externalHeightMm} mm •{' '}
              {activeFinishName.length > 26
                ? `${activeFinishName.slice(0, 26)}…`
                : activeFinishName}
            </text>

            {/* Column 3 Top: Drawing Reference */}
            <text x="634" y="18" fill={textMuted} fontSize="9" fontWeight="700">
              DRAWING REF NO.
            </text>
            <text x="634" y="37" fill={dimColor} fontSize="12" fontWeight="700">
              CAD-{product.sku}-R4
            </text>

            {/* Column 3 Bottom: Tolerance & Projection */}
            <text x="634" y="67" fill={textMuted} fontSize="9" fontWeight="700">
              JIG TOLERANCE / UNITS
            </text>
            <text x="634" y="86" fill={textPrimary} fontSize="11" fontWeight="700">
              ±2.0mm • {showDualUnits ? 'MM / INCH' : 'MILLIMETRES'}
            </text>

            {/* Column 4 Top: Rated SWL */}
            <text x="818" y="18" fill={textMuted} fontSize="9" fontWeight="700">
              CERTIFIED SWL
            </text>
            <text x="818" y="37" fill={accentAmber} fontSize="13" fontWeight="800">
              {product.swlKg.toLocaleString('en-GB')} KG UDL
            </text>

            {/* Column 4 Bottom: Sheet & Scale */}
            <text x="818" y="67" fill={textMuted} fontSize="9" fontWeight="700">
              PROJECTION / SHEET
            </text>
            <text x="818" y="86" fill={textPrimary} fontSize="11" fontWeight="700">
              BS 8888 • SHEET 1/1
            </text>
          </g>
        </svg>
      </div>

      {/* Accessible Figcaption with Machine-Readable Summary */}
      <figcaption className="px-4 py-2.5 bg-surface-sandLight border-t border-steel-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-steel-600">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5 text-stillage-blue shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-brand-navy">Generated from Product Content Item:</strong>{' '}
            Primary elevation (<code className="text-brand-navy">{product.primaryImage}</code>) +{' '}
            {product.externalLengthMm}×{product.externalWidthMm}×{product.externalHeightMm}mm ({footprintSqM} m² footprint)
          </span>
        </div>
        <span className="text-steel-600">
          Tolerance: ±2mm Welded Box-Section Jig • BS EN 10219 S275JR
        </span>
      </figcaption>
    </figure>
  );
}
