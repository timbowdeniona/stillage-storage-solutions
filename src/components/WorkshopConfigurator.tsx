'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Compass,
  Copy,
  Download,
  FileCode2,
  HelpCircle,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  Palette,
  Plus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Trash2,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { OrderBasketItem, useVat } from '@/context/VatContext';
import { FINISH_OPTIONS, MOBILITY_OPTIONS } from '@/data/seedCatalog';
import {
  WORKSHOP_MODULE_CATALOG,
  WORKSHOP_PRESETS,
  getWorkshopModuleById,
  validateStackConfiguration,
} from '@/data/workshopModules';
import { getBulkDiscountPercentage, getFinishModifierPence, getMobilityModifierPence } from '@/lib/pricing';
import {
  FootprintFamilyId,
  WorkshopModuleDef,
  WorkshopStackTier,
} from '@/types/catalog';

interface WorkshopConfiguratorProps {
  initialPresetId?: string;
  initialSku?: string;
}

const FINISH_COLOR_MAP: Record<string, { stroke: string; fill: string; accent: string; label: string }> = {
  'standard-blue': {
    stroke: '#145DA0',
    fill: '#1D63A3',
    accent: '#38BDF8',
    label: 'RAL 5010 Stillage Blue',
  },
  'galvanised': {
    stroke: '#7E8B99',
    fill: '#A0ACB9',
    accent: '#E2E8F0',
    label: 'Hot-Dip Galvanised (BS EN ISO 1461)',
  },
  'raw-steel': {
    stroke: '#47515D',
    fill: '#5A636E',
    accent: '#94A3B8',
    label: 'Raw Mill Steel (Self-Colour)',
  },
  'custom-ral': {
    stroke: '#0F2342',
    fill: '#1A365D',
    accent: '#FBBF24',
    label: 'Custom Corporate RAL',
  },
};

const CLEARANCE_PRESETS = [
  { label: 'HGV Curtain-Sider', heightMm: 2650 },
  { label: 'Roller Shutter Door', heightMm: 3000 },
  { label: 'Standard Racking Beam', heightMm: 3600 },
  { label: 'High-Bay Workshop Eaves', heightMm: 4500 },
];

export function WorkshopConfigurator({ initialPresetId, initialSku }: WorkshopConfiguratorProps) {
  const { addToBasket, formatPrice, formatBothPrices, showIncVat } = useVat();
  const instanceId = useId().replace(/:/g, '');
  const titleId = `workshop-cad-${instanceId}`;
  const descId = `workshop-desc-${instanceId}`;
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize preset or module
  const initialPreset =
    WORKSHOP_PRESETS.find((p) => p.id === initialPresetId) ||
    (initialSku ? undefined : WORKSHOP_PRESETS[0]);

  const [activeFootprint, setActiveFootprint] = useState<FootprintFamilyId>(
    initialPreset?.footprintFamily || 'euro-uk-1210'
  );

  const [tiers, setTiers] = useState<WorkshopStackTier[]>(() => {
    if (initialPreset) {
      return initialPreset.tiers.map((t, idx) => ({
        ...t,
        tierId: `tier-${Date.now()}-${idx}`,
      }));
    }
    const matchingModule =
      WORKSHOP_MODULE_CATALOG.find((m) => m.sku.toLowerCase() === initialSku?.toLowerCase()) ||
      WORKSHOP_MODULE_CATALOG.find((m) => m.footprintFamily === 'euro-uk-1210') ||
      WORKSHOP_MODULE_CATALOG[0];

    return [
      {
        tierId: `tier-${Date.now()}-0`,
        moduleId: matchingModule.id,
        tierIndex: 0,
        finishOption: 'standard-blue',
        mobilityOption: 'forklift-pockets',
        customLabel: `Tier 1: ${matchingModule.name}`,
      },
      {
        tierId: `tier-${Date.now()}-1`,
        moduleId: matchingModule.id,
        tierIndex: 1,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: `Tier 2: ${matchingModule.name}`,
      },
    ];
  });

  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(0);
  const [clearanceLimitMm, setClearanceLimitMm] = useState<number>(
    initialPreset?.defaultClearanceMm || 3600
  );
  const [cadTheme, setCadTheme] = useState<'blueprint-dark' | 'drafting-light'>('blueprint-dark');
  const [viewMode, setViewMode] = useState<'isometric' | 'elevation'>('isometric');
  const [showHumanScale, setShowHumanScale] = useState<boolean>(true);
  const [stackMultiplier, setStackMultiplier] = useState<number>(1);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [basketToast, setBasketToast] = useState<string | null>(null);

  // Validate configuration in real time
  const engineering = useMemo(
    () => validateStackConfiguration(tiers, clearanceLimitMm),
    [tiers, clearanceLimitMm]
  );

  const activeModuleDef =
    tiers[selectedTierIndex]
      ? getWorkshopModuleById(tiers[selectedTierIndex].moduleId)
      : undefined;

  // Compatible modules for the current active footprint
  const compatibleModules = useMemo(
    () => WORKSHOP_MODULE_CATALOG.filter((m) => m.footprintFamily === activeFootprint),
    [activeFootprint]
  );

  // Theme colours
  const isDark = cadTheme === 'blueprint-dark';
  const bgStage = isDark ? '#09172C' : '#FAF5EE';
  const bgGridMajor = isDark ? 'rgba(33, 118, 199, 0.3)' : 'rgba(20, 93, 160, 0.18)';
  const bgGridMinor = isDark ? 'rgba(33, 118, 199, 0.12)' : 'rgba(20, 93, 160, 0.08)';
  const lineDimColor = isDark ? '#38BDF8' : '#145DA0';
  const textPrimary = isDark ? '#FFFFFF' : '#0F2342';
  const textMuted = isDark ? '#94A3B8' : '#5A636E';

  // Load a preset
  const handleLoadPreset = (preset: (typeof WORKSHOP_PRESETS)[0]) => {
    setActiveFootprint(preset.footprintFamily);
    setClearanceLimitMm(preset.defaultClearanceMm);
    setTiers(
      preset.tiers.map((t, idx) => ({
        ...t,
        tierId: `tier-${Date.now()}-${idx}`,
      }))
    );
    setSelectedTierIndex(0);
    setExportStatus(`Loaded "${preset.title}" preset.`);
  };

  // Add module
  const handleAddModule = (moduleDef: WorkshopModuleDef) => {
    if (tiers.length >= 6) {
      alert('Workshop supports configurations up to 6 tiers maximum.');
      return;
    }
    const newTier: WorkshopStackTier = {
      tierId: `tier-${Date.now()}-${tiers.length}`,
      moduleId: moduleDef.id,
      tierIndex: tiers.length,
      finishOption: tiers[0]?.finishOption || 'standard-blue',
      mobilityOption: 'standard-feet',
      customLabel: `Tier ${tiers.length + 1}: ${moduleDef.name}`,
    };
    setTiers((prev) => [...prev, newTier]);
    setSelectedTierIndex(tiers.length);
    setIsAddModalOpen(false);
  };

  // Tier manipulation
  const handleMoveTier = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index >= tiers.length - 1) return;
    if (direction === 'down' && index <= 0) return;
    const targetIdx = direction === 'up' ? index + 1 : index - 1;
    const next = [...tiers];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    // Re-index
    const reindexed = next.map((t, i) => ({ ...t, tierIndex: i }));
    setTiers(reindexed);
    setSelectedTierIndex(targetIdx);
  };

  const handleDuplicateTier = (index: number) => {
    if (tiers.length >= 6) return;
    const source = tiers[index];
    const newTier: WorkshopStackTier = {
      ...source,
      tierId: `tier-${Date.now()}-${tiers.length}`,
      tierIndex: tiers.length,
      mobilityOption: 'standard-feet', // Upper tiers always use stacking feet
    };
    setTiers((prev) => [...prev, newTier]);
    setSelectedTierIndex(tiers.length);
  };

  const handleDeleteTier = (index: number) => {
    if (tiers.length <= 1) {
      alert('At least one module tier is required in the assembly.');
      return;
    }
    const next = tiers.filter((_, i) => i !== index).map((t, i) => ({ ...t, tierIndex: i }));
    setTiers(next);
    setSelectedTierIndex(Math.max(0, index - 1));
  };

  const handleUpdateTierFinish = (finish: WorkshopStackTier['finishOption']) => {
    if (selectedTierIndex === null || !tiers[selectedTierIndex]) return;
    setTiers((prev) =>
      prev.map((t, i) => (i === selectedTierIndex ? { ...t, finishOption: finish } : t))
    );
  };

  const handleUpdateTierMobility = (mobility: WorkshopStackTier['mobilityOption']) => {
    // Mobility option applies to base tier (Tier 0)
    setTiers((prev) =>
      prev.map((t, i) => (i === 0 ? { ...t, mobilityOption: mobility } : t))
    );
  };

  // Pricing calculation for entire configuration
  const bomItems = useMemo(() => {
    return tiers.map((tier) => {
      const mod = getWorkshopModuleById(tier.moduleId) || WORKSHOP_MODULE_CATALOG[0];
      const finishMod = getFinishModifierPence(tier.finishOption);
      const mobilityMod = tier.tierIndex === 0 ? getMobilityModifierPence(tier.mobilityOption) : 0;
      const unitConfiguredPence = Math.max(1000, mod.basePriceExVatPence + finishMod + mobilityMod);
      return {
        tier,
        mod,
        finishMod,
        mobilityMod,
        unitConfiguredPence,
      };
    });
  }, [tiers]);

  const singleStackSubtotalPence = bomItems.reduce((acc, b) => acc + b.unitConfiguredPence, 0);
  const totalFleetUnits = tiers.length * stackMultiplier;
  const bulkDiscountPct = getBulkDiscountPercentage(totalFleetUnits);
  const totalFleetExVatPence = Math.round(
    singleStackSubtotalPence * stackMultiplier * (1 - bulkDiscountPct / 100)
  );

  // Add all tiers to order basket
  const handleAddConfigurationToBasket = () => {
    for (const item of bomItems) {
      const finishObj = FINISH_OPTIONS.find((f) => f.id === item.tier.finishOption);
      const mobilityObj = MOBILITY_OPTIONS.find((m) => m.id === item.tier.mobilityOption);
      const basketItem: OrderBasketItem = {
        sku: item.mod.sku,
        title: item.mod.name,
        slug: item.mod.sku.toLowerCase(),
        quantity: stackMultiplier,
        basePriceExVatPence: item.mod.basePriceExVatPence,
        finishOption: item.tier.finishOption,
        finishName: finishObj?.name || item.tier.finishOption,
        mobilityOption: item.tier.tierIndex === 0 ? item.tier.mobilityOption : 'standard-feet',
        mobilityName:
          item.tier.tierIndex === 0
            ? mobilityObj?.name || 'Standard Pressed Feet'
            : 'Standard Pressed Steel Stacking Feet',
        primaryImage: item.mod.primaryImage,
        unitPriceExVatPence: item.unitConfiguredPence,
        lineTotalExVatPence: item.unitConfiguredPence * stackMultiplier,
      };
      addToBasket(basketItem);
    }
    setBasketToast(
      `Added ${stackMultiplier} × ${tiers.length}-tier assembly (${totalFleetUnits} total units) to your order basket!`
    );
    setTimeout(() => setBasketToast(null), 5000);
  };

  // Standalone Vector SVG Export
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const clonedSvg = svgRef.current.cloneNode(true) as SVGSVGElement;
    clonedSvg.querySelectorAll('[data-interactive-handle="true"]').forEach((el) => el.remove());
    const serializer = new XMLSerializer();
    const source = `<?xml version="1.0" encoding="UTF-8"?>\n${serializer.serializeToString(clonedSvg)}`;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stillage-workshop-stack-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportStatus('Assembly blueprint exported as multi-layer SVG (BS 8888 compliant).');
  };

  // High-Res PNG CAD Sheet Export
  const handleExportPng = () => {
    if (!svgRef.current) return;
    setExportStatus('Rendering 2400×1800 high-res CAD sheet...');
    const clonedSvg = svgRef.current.cloneNode(true) as SVGSVGElement;
    clonedSvg.querySelectorAll('[data-interactive-handle="true"]').forEach((el) => el.remove());
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 1800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = isDark ? '#09172C' : '#FAF5EE';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `stillage-workshop-stack-sheet-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportStatus('High-resolution PNG CAD sheet exported successfully.');
      }
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;
  };

  // Canvas Geometry for Drawing Stack
  const canvasWidth = 1100;
  const canvasHeight = 850;
  const groundY = 720;
  const stackCenterX = 560;

  // Calculate tier drawing coordinates bottom-to-top
  const tierDrawData = useMemo(() => {
    // Scale mm to canvas pixels (approx 1mm = 0.13px depending on height)
    const maxHeightMm = Math.max(clearanceLimitMm, engineering.totalAssembledHeightMm, 2800);
    const availableDrawingHeight = 520;
    const scale = availableDrawingHeight / maxHeightMm;

    let currentBottomY = groundY;
    const baseTier = tiers[0];
    let baseOffsetPx = 0;
    if (
      baseTier?.mobilityOption === 'heavy-duty-castors' ||
      baseTier?.mobilityOption === 'both-castors-pockets'
    ) {
      baseOffsetPx = 28; // castor wheels
    } else if (baseTier?.mobilityOption === 'forklift-pockets') {
      baseOffsetPx = 14; // forklift pockets
    }
    currentBottomY -= baseOffsetPx;

    const items = tiers.map((tier, idx) => {
      const mod = getWorkshopModuleById(tier.moduleId) || WORKSHOP_MODULE_CATALOG[0];
      const tierHeightPx = Math.round(mod.externalHeightMm * scale);
      const cupEngagePx = idx === 0 ? 0 : Math.round(mod.cupEngagementMm * scale);
      const drawBottomY = currentBottomY + cupEngagePx;
      const drawTopY = drawBottomY - tierHeightPx;

      currentBottomY = drawTopY;

      // Width and depth in isometric view
      const widthPx = Math.round(mod.lengthMm * scale * 0.55);
      const depthPx = Math.round(mod.widthMm * scale * 0.32);

      return {
        tier,
        mod,
        idx,
        drawBottomY,
        drawTopY,
        tierHeightPx,
        widthPx,
        depthPx,
      };
    });

    return { items, scale, groundY, baseOffsetPx };
  }, [tiers, clearanceLimitMm, engineering.totalAssembledHeightMm]);

  return (
    <div className="space-y-8">
      {/* Top Presets & Footprint Toolbar */}
      <div className="bg-surface-white border border-steel-200 p-4 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-stillage-blue uppercase">
            <Sliders className="w-3.5 h-3.5" />
            <span>Preset Stacking Architectures</span>
          </div>
          <h2 className="font-display font-bold text-base text-brand-navy uppercase mt-0.5">
            Select a Modular Architecture or Build from Scratch
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {WORKSHOP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-sm border transition-colors ${
                activeFootprint === preset.footprintFamily && tiers.length === preset.tiers.length
                  ? 'bg-stillage-blue text-white border-stillage-blue shadow-sm'
                  : 'bg-surface-sandLight hover:bg-surface-sand text-brand-navy border-steel-300'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workshop Grid: Left (Tier Editor) | Center (SVG Stage) | Right (BOM & Basket) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Stack Tiers Manager (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface-white border border-steel-200 rounded-sm shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-brand-navy text-surface-white flex items-center justify-between">
              <span className="font-display font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-teal" />
                Stack Tiers ({tiers.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-accent-teal hover:bg-teal-600 text-brand-navy font-mono text-xs font-bold px-2.5 py-1 rounded-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            {/* Tier list ordered top-to-bottom for intuitive stacking visual */}
            <div className="p-3 divide-y divide-steel-200 space-y-2">
              {[...tiers].reverse().map((tier) => {
                const actualIndex = tier.tierIndex;
                const isSelected = selectedTierIndex === actualIndex;
                const mod = getWorkshopModuleById(tier.moduleId) || WORKSHOP_MODULE_CATALOG[0];
                const finishColor = FINISH_COLOR_MAP[tier.finishOption] || FINISH_COLOR_MAP['standard-blue'];

                return (
                  <div
                    key={tier.tierId}
                    onClick={() => setSelectedTierIndex(actualIndex)}
                    className={`pt-2 pb-2 px-2.5 rounded-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-surface-sand border-2 border-stillage-blue shadow-xs'
                        : 'hover:bg-surface-sandLight border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-brand-navy">
                        {actualIndex === 0 ? 'Tier 1 (Base)' : `Tier ${actualIndex + 1}`}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: finishColor.fill }}
                        title={finishColor.label}
                      />
                    </div>
                    <div className="font-display font-bold text-xs uppercase text-brand-navy truncate mt-0.5">
                      {mod.name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-steel-600 mt-1">
                      <span>{mod.externalHeightMm} mm • {mod.unitWeightKg} kg</span>
                      <span className="font-bold text-stillage-blue">
                        {formatPrice(mod.basePriceExVatPence)}
                      </span>
                    </div>

                    {/* Quick controls when selected */}
                    {isSelected && (
                      <div className="flex items-center justify-between gap-1 pt-2 mt-2 border-t border-steel-300/80 text-[11px] font-mono">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Move tier up"
                            disabled={actualIndex >= tiers.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTier(actualIndex, 'up');
                            }}
                            className="p-1 rounded bg-surface-white hover:bg-steel-200 disabled:opacity-30 border border-steel-300"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            title="Move tier down"
                            disabled={actualIndex <= 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTier(actualIndex, 'down');
                            }}
                            className="p-1 rounded bg-surface-white hover:bg-steel-200 disabled:opacity-30 border border-steel-300"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            title="Duplicate tier"
                            disabled={tiers.length >= 6}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateTier(actualIndex);
                            }}
                            className="p-1 rounded bg-surface-white hover:bg-steel-200 disabled:opacity-30 border border-steel-300"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          title="Remove tier"
                          disabled={tiers.length <= 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTier(actualIndex);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded border border-steel-300 disabled:opacity-30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Tier Inspector (Finish & Mobility Controls) */}
          {activeModuleDef && tiers[selectedTierIndex] && (
            <div className="bg-surface-white border border-steel-200 p-4 rounded-sm shadow-sm space-y-4">
              <div className="border-b border-steel-200 pb-2">
                <span className="font-mono text-[10px] text-stillage-blue font-bold uppercase tracking-wider">
                  Tier {selectedTierIndex + 1} Inspector
                </span>
                <h3 className="font-display font-bold text-sm uppercase text-brand-navy">
                  {activeModuleDef.name}
                </h3>
              </div>

              {/* Finish Option Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-brand-navy mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-stillage-blue" />
                  Surface Finish Option
                </label>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  {FINISH_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleUpdateTierFinish(f.id as any)}
                      className={`p-2 rounded-sm border text-left flex items-center gap-2 transition-colors ${
                        tiers[selectedTierIndex].finishOption === f.id
                          ? 'border-stillage-blue bg-surface-sand text-brand-navy font-bold ring-1 ring-stillage-blue'
                          : 'border-steel-200 hover:bg-surface-sandLight text-steel-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: f.swatchHex }}
                      />
                      <span className="truncate">{f.name.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Mobility Selector (Tier 0 only) */}
              {selectedTierIndex === 0 && (
                <div>
                  <label className="block text-xs font-mono font-bold text-brand-navy mb-1.5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-accent-amber" />
                    Ground Tier Base Handling / Mobility
                  </label>
                  <div className="space-y-1 font-mono text-[11px]">
                    {MOBILITY_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleUpdateTierMobility(m.id as any)}
                        className={`w-full p-2 rounded-sm border text-left flex items-center justify-between transition-colors ${
                          tiers[0].mobilityOption === m.id
                            ? 'border-stillage-blue bg-surface-sand text-brand-navy font-bold ring-1 ring-stillage-blue'
                            : 'border-steel-200 hover:bg-surface-sandLight text-steel-700'
                        }`}
                      >
                        <span className="truncate">{m.name}</span>
                        {m.priceModifierPence > 0 && (
                          <span className="text-[10px] text-stillage-blue font-bold shrink-0 ml-1">
                            +{formatPrice(m.priceModifierPence)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Warehouse Clearance Height Slider */}
              <div className="pt-2 border-t border-steel-200">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-brand-navy mb-1">
                  <span className="flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-stillage-blue" />
                    Clearance Line
                  </span>
                  <span className="text-stillage-blue">{clearanceLimitMm} mm</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={5500}
                  step={50}
                  value={clearanceLimitMm}
                  onChange={(e) => setClearanceLimitMm(Number(e.target.value))}
                  className="w-full accent-stillage-blue"
                  aria-label="Warehouse clearance limit in millimetres"
                />
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {CLEARANCE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setClearanceLimitMm(p.heightMm)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        clearanceLimitMm === p.heightMm
                          ? 'bg-brand-navy text-white font-bold border-brand-navy'
                          : 'bg-surface-sandLight text-steel-700 border-steel-300 hover:bg-surface-sand'
                      }`}
                    >
                      {p.label} ({p.heightMm})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: Interactive SVG Blueprint Stage (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="border border-steel-300 bg-surface-white rounded-sm shadow-md overflow-hidden">
            {/* Top Blueprint Bar */}
            <div className="px-4 py-2.5 bg-brand-navy text-surface-white border-b border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-teal" />
                <span className="font-display font-bold uppercase tracking-wider text-surface-white">
                  Workshop CAD Canvas • BS 8888
                </span>
                <span className="text-surface-sand text-[11px] hidden sm:inline">
                  {engineering.totalAssembledHeightMm} mm Assembled Height
                </span>
              </div>

              {/* Canvas controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCadTheme(cadTheme === 'blueprint-dark' ? 'drafting-light' : 'blueprint-dark')
                  }
                  className={`px-2 py-1 rounded text-[11px] font-bold border ${
                    cadTheme === 'blueprint-dark'
                      ? 'bg-stillage-blue text-white border-stillage-blueLight'
                      : 'bg-surface-sand text-brand-navy border-surface-sandDark'
                  }`}
                >
                  {cadTheme === 'blueprint-dark' ? 'Dark Blueprint' : 'Light Drafting'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode(viewMode === 'isometric' ? 'elevation' : 'isometric')
                  }
                  className="px-2 py-1 rounded text-[11px] font-bold bg-brand-navyDark text-surface-sand border border-white/20 hover:border-white/40"
                >
                  {viewMode === 'isometric' ? 'Isometric 3D' : 'Front Elevation'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowHumanScale(!showHumanScale)}
                  className={`px-2 py-1 rounded text-[11px] font-bold border ${
                    showHumanScale
                      ? 'bg-accent-teal text-brand-navy border-accent-teal'
                      : 'bg-brand-navyDark text-steel-400 border-white/20'
                  }`}
                  title="Toggle 1750mm human operator silhouette for scale"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SVG STAGE */}
            <div className="relative w-full overflow-x-auto p-1 bg-brand-navyDark flex justify-center">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                className="w-full h-auto max-h-[640px] select-none"
                style={{ backgroundColor: bgStage }}
                aria-labelledby={titleId}
                aria-describedby={descId}
              >
                <title id={titleId}>
                  Stillage Workshop Multi-Tier CAD Assembly Blueprint — {engineering.totalTiers} Tiers
                </title>
                <desc id={descId}>
                  Parametric vector blueprint showing stacked stillage modules, overall height of{' '}
                  {engineering.totalAssembledHeightMm} mm, and clearance compliance.
                </desc>

                {/* DEFS: Patterns, Grids, and Markers */}
                <defs>
                  <pattern id="workshop-grid-minor" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke={bgGridMinor} strokeWidth="0.8" />
                  </pattern>
                  <pattern id="workshop-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#workshop-grid-minor)" />
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke={bgGridMajor} strokeWidth="1.2" />
                  </pattern>
                  <pattern id="weldmesh-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
                  </pattern>
                  <pattern id="corrugation-pattern" width="16" height="100" patternUnits="userSpaceOnUse">
                    <line x1="8" y1="0" x2="8" y2="100" stroke="rgba(0,0,0,0.22)" strokeWidth="1.5" />
                  </pattern>

                  {/* Dimension arrow markers */}
                  <marker
                    id="workshop-arrow-start"
                    viewBox="0 0 10 10"
                    refX="2"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill={lineDimColor} />
                  </marker>
                  <marker
                    id="workshop-arrow-end"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={lineDimColor} />
                  </marker>
                  <marker
                    id="clearance-arrow-end"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path
                      d="M 0 1.5 L 10 5 L 0 8.5 z"
                      fill={engineering.isClearanceCompliant ? '#10B981' : '#EF4444'}
                    />
                  </marker>
                </defs>

                {/* LAYER 1: Sheet Grid & Technical Border */}
                <g id="layer-sheet-grid">
                  <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="url(#workshop-grid-major)" />
                  <rect
                    x="24"
                    y="24"
                    width={canvasWidth - 48}
                    height={canvasHeight - 48}
                    fill="none"
                    stroke={isDark ? '#2176C7' : '#0F2342'}
                    strokeWidth="2"
                  />
                  <rect
                    x="30"
                    y="30"
                    width={canvasWidth - 60}
                    height={canvasHeight - 60}
                    fill="none"
                    stroke={isDark ? 'rgba(33, 118, 199, 0.4)' : 'rgba(15, 35, 66, 0.3)'}
                    strokeWidth="1"
                  />

                  {/* Zone Coordinates */}
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((zone, i) => (
                    <text
                      key={zone}
                      x={60 + i * 170}
                      y="20"
                      fill={textMuted}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ZONE {zone}
                    </text>
                  ))}
                  {['1', '2', '3', '4'].map((zone, i) => (
                    <text
                      key={zone}
                      x="10"
                      y={100 + i * 180}
                      fill={textMuted}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {zone}
                    </text>
                  ))}
                </g>

                {/* Ground Line */}
                <line
                  x1="80"
                  y1={groundY}
                  x2="950"
                  y2={groundY}
                  stroke={isDark ? '#38BDF8' : '#0F2342'}
                  strokeWidth="2.5"
                />
                {/* Ground hatching ticks */}
                {Array.from({ length: 28 }).map((_, i) => (
                  <line
                    key={i}
                    x1={90 + i * 30}
                    y1={groundY}
                    x2={80 + i * 30}
                    y2={groundY + 10}
                    stroke={textMuted}
                    strokeWidth="1"
                  />
                ))}
                <text
                  x="960"
                  y={groundY + 4}
                  fill={textMuted}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  GROUND DATUM (0.00 MM)
                </text>

                {/* LAYER 2: Clearance Limit Line */}
                {(() => {
                  const clearanceY = groundY - Math.round(clearanceLimitMm * tierDrawData.scale);
                  const isSafe = engineering.isClearanceCompliant;
                  const lineColor = isSafe ? '#10B981' : '#EF4444';
                  return (
                    <g id="layer-clearance-limit">
                      <line
                        x1="80"
                        y1={clearanceY}
                        x2="950"
                        y2={clearanceY}
                        stroke={lineColor}
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <rect
                        x="730"
                        y={clearanceY - 18}
                        width="220"
                        height="16"
                        fill={isSafe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.2)'}
                        stroke={lineColor}
                        strokeWidth="1"
                        rx="2"
                      />
                      <text
                        x="740"
                        y={clearanceY - 6}
                        fill={lineColor}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        CLEARANCE: {clearanceLimitMm} MM ({isSafe ? `+${engineering.clearanceMarginMm} MM OK` : `BREACHED BY ${Math.abs(engineering.clearanceMarginMm)} MM`})
                      </text>
                    </g>
                  );
                })()}

                {/* LAYER 3: Human Scale Silhouette (1750 mm) */}
                {showHumanScale && (() => {
                  const humanH = Math.round(1750 * tierDrawData.scale);
                  const humanX = 200;
                  const humanY = groundY;
                  return (
                    <g id="layer-human-scale" opacity="0.85">
                      {/* Head */}
                      <circle
                        cx={humanX}
                        cy={humanY - humanH + 12}
                        r="12"
                        fill={isDark ? '#F2E3CE' : '#47515D'}
                      />
                      {/* Torso */}
                      <path
                        d={`M ${humanX - 12} ${humanY - humanH + 26} L ${humanX + 12} ${humanY - humanH + 26} L ${humanX + 8} ${humanY - humanH * 0.45} L ${humanX - 8} ${humanY - humanH * 0.45} Z`}
                        fill={isDark ? '#F2E3CE' : '#47515D'}
                      />
                      {/* Legs */}
                      <line
                        x1={humanX - 5}
                        y1={humanY - humanH * 0.45}
                        x2={humanX - 7}
                        y2={humanY}
                        stroke={isDark ? '#F2E3CE' : '#47515D'}
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <line
                        x1={humanX + 5}
                        y1={humanY - humanH * 0.45}
                        x2={humanX + 7}
                        y2={humanY}
                        stroke={isDark ? '#F2E3CE' : '#47515D'}
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <text
                        x={humanX - 35}
                        y={humanY - humanH - 4}
                        fill={textMuted}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        OPERATOR (1750 MM)
                      </text>
                    </g>
                  );
                })()}

                {/* LAYER 4: Base Mobility Graphics (Castors / Forklift Pockets) on Ground Floor */}
                {tierDrawData.baseOffsetPx > 0 && (() => {
                  const baseW = tierDrawData.items[0]?.widthPx || 180;
                  const isCastors =
                    tiers[0].mobilityOption === 'heavy-duty-castors' ||
                    tiers[0].mobilityOption === 'both-castors-pockets';
                  return (
                    <g id="layer-base-mobility">
                      {isCastors ? (
                        <>
                          {/* Castor wheels */}
                          <circle cx={stackCenterX - baseW * 0.4} cy={groundY - 14} r="12" fill="#334155" stroke="#FBBF24" strokeWidth="2" />
                          <circle cx={stackCenterX + baseW * 0.4} cy={groundY - 14} r="12" fill="#334155" stroke="#FBBF24" strokeWidth="2" />
                          <circle cx={stackCenterX - baseW * 0.4} cy={groundY - 14} r="4" fill="#FBBF24" />
                          <circle cx={stackCenterX + baseW * 0.4} cy={groundY - 14} r="4" fill="#FBBF24" />
                          {/* Brackets */}
                          <rect x={stackCenterX - baseW * 0.4 - 8} y={groundY - 26} width="16" height="12" fill="#64748B" />
                          <rect x={stackCenterX + baseW * 0.4 - 8} y={groundY - 26} width="16" height="12" fill="#64748B" />
                        </>
                      ) : (
                        <>
                          {/* Forklift Guide Channels */}
                          <rect x={stackCenterX - baseW * 0.35} y={groundY - 14} width="34" height="14" fill="#1E293B" stroke="#D97706" strokeWidth="1.5" />
                          <rect x={stackCenterX + baseW * 0.35 - 34} y={groundY - 14} width="34" height="14" fill="#1E293B" stroke="#D97706" strokeWidth="1.5" />
                        </>
                      )}
                    </g>
                  );
                })()}

                {/* LAYER 5: Stacked Modules (Parametric Vectorlinework) */}
                <g id="layer-stacked-modules">
                  {tierDrawData.items.map((item) => {
                    const isSelected = selectedTierIndex === item.idx;
                    const finishStyle = FINISH_COLOR_MAP[item.tier.finishOption] || FINISH_COLOR_MAP['standard-blue'];
                    const isIso = viewMode === 'isometric';

                    const halfW = item.widthPx / 2;
                    const halfD = isIso ? item.depthPx / 2 : 0;
                    const xL = stackCenterX - halfW;
                    const xR = stackCenterX + halfW;
                    const yB = item.drawBottomY;
                    const yT = item.drawTopY;

                    return (
                      <g
                        key={item.tier.tierId}
                        id={`module-tier-${item.idx}`}
                        className="cursor-pointer transition-opacity"
                        onClick={() => setSelectedTierIndex(item.idx)}
                      >
                        {/* Selected Highlighting Glow */}
                        {isSelected && (
                          <rect
                            x={xL - 8}
                            y={yT - 6}
                            width={item.widthPx + (isIso ? halfD : 0) + 16}
                            height={item.tierHeightPx + 12}
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="2.5"
                            strokeDasharray="4 3"
                            rx="4"
                          />
                        )}

                        {/* Stillage Main Body Box */}
                        {isIso ? (
                          <>
                            {/* Front Face */}
                            <path
                              d={`M ${xL} ${yB} L ${xR} ${yB} L ${xR} ${yT} L ${xL} ${yT} Z`}
                              fill={finishStyle.fill}
                              stroke={finishStyle.stroke}
                              strokeWidth="2"
                            />
                            {/* Top Face */}
                            <path
                              d={`M ${xL} ${yT} L ${xR} ${yT} L ${xR + halfD} ${yT - halfD} L ${xL + halfD} ${yT - halfD} Z`}
                              fill={finishStyle.stroke}
                              stroke={finishStyle.accent}
                              strokeWidth="1.5"
                              opacity="0.9"
                            />
                            {/* Right Side Face */}
                            <path
                              d={`M ${xR} ${yB} L ${xR + halfD} ${yB - halfD} L ${xR + halfD} ${yT - halfD} L ${xR} ${yT} Z`}
                              fill={finishStyle.fill}
                              stroke={finishStyle.stroke}
                              strokeWidth="1.5"
                              filter="brightness(0.85)"
                            />
                          </>
                        ) : (
                          /* Front Elevation View */
                          <rect
                            x={xL}
                            y={yT}
                            width={item.widthPx}
                            height={item.tierHeightPx}
                            fill={finishStyle.fill}
                            stroke={finishStyle.stroke}
                            strokeWidth="2"
                          />
                        )}

                        {/* Internal Feature Texturing */}
                        {item.mod.moduleRole === 'standard-cage' && (
                          /* Weldmesh grid or corrugation overlay */
                          <rect
                            x={xL + 10}
                            y={yT + 8}
                            width={item.widthPx - 20}
                            height={item.tierHeightPx - 16}
                            fill={
                              item.mod.sku.includes('MSH')
                                ? 'url(#weldmesh-pattern)'
                                : 'url(#corrugation-pattern)'
                            }
                            opacity="0.65"
                          />
                        )}

                        {item.mod.moduleRole === 'top-hopper' && (
                          /* Hopper funnel trapezoid */
                          <path
                            d={`M ${xL + 12} ${yT + 6} L ${xR - 12} ${yT + 6} L ${stackCenterX + 25} ${yB - 8} L ${stackCenterX - 25} ${yB - 8} Z`}
                            fill="#0A1E3C"
                            stroke="#FBBF24"
                            strokeWidth="1.5"
                            opacity="0.85"
                          />
                        )}

                        {item.mod.moduleRole === 'base-stand' && (
                          /* Truss bracing on stand */
                          <>
                            <line x1={xL + 8} y1={yT + 8} x2={xR - 8} y2={yB - 8} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                            <line x1={xR - 8} y1={yT + 8} x2={xL + 8} y2={yB - 8} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                          </>
                        )}

                        {/* Corner Stanchions (vertical posts) */}
                        <line x1={xL + 4} y1={yB} x2={xL + 4} y2={yT} stroke={finishStyle.accent} strokeWidth="3" />
                        <line x1={xR - 4} y1={yB} x2={xR - 4} y2={yT} stroke={finishStyle.accent} strokeWidth="3" />

                        {/* Pressed Pyramid Stacking Feet & Receiver Cups */}
                        {/* Top Receiver Cup */}
                        <polygon
                          points={`${xL - 2},${yT} ${xL + 10},${yT} ${xL + 8},${yT - 8} ${xL},${yT - 8}`}
                          fill="#D97706"
                        />
                        <polygon
                          points={`${xR - 10},${yT} ${xR + 2},${yT} ${xR},${yT - 8} ${xR - 8},${yT - 8}`}
                          fill="#D97706"
                        />

                        {/* Bottom Pyramid Foot */}
                        <polygon
                          points={`${xL},${yB} ${xL + 8},${yB} ${xL + 6},${yB + 6} ${xL + 2},${yB + 6}`}
                          fill="#D97706"
                        />
                        <polygon
                          points={`${xR - 8},${yB} ${xR},${yB} ${xR - 2},${yB + 6} ${xR - 6},${yB + 6}`}
                          fill="#D97706"
                        />

                        {/* Tier Label Badge */}
                        <rect
                          x={xL + 14}
                          y={yT + 12}
                          width="78"
                          height="18"
                          fill="rgba(15, 35, 66, 0.85)"
                          stroke="rgba(255,255,255,0.3)"
                          rx="2"
                        />
                        <text
                          x={xL + 18}
                          y={yT + 25}
                          fill="#FFFFFF"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          TIER {item.idx + 1}: {item.mod.sku}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* LAYER 6: Dynamic Dimension Leaders */}
                <g id="layer-dimensions">
                  {/* Overall Stack Height Leader (Right side) */}
                  {(() => {
                    const topY = tierDrawData.items[tierDrawData.items.length - 1]?.drawTopY || 200;
                    const dimX = 860;
                    return (
                      <g>
                        {/* Extension lines */}
                        <line x1="740" y1={topY} x2={dimX + 20} y2={topY} stroke={lineDimColor} strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="740" y1={groundY} x2={dimX + 20} y2={groundY} stroke={lineDimColor} strokeWidth="1" strokeDasharray="3 3" />
                        {/* Dimension Line with double arrows */}
                        <line
                          x1={dimX}
                          y1={topY + 6}
                          x2={dimX}
                          y2={groundY - 6}
                          stroke={lineDimColor}
                          strokeWidth="2"
                          markerStart="url(#workshop-arrow-start)"
                          markerEnd="url(#workshop-arrow-end)"
                        />
                        {/* Label Badge */}
                        <rect
                          x={dimX - 58}
                          y={(topY + groundY) / 2 - 14}
                          width="116"
                          height="28"
                          fill={isDark ? '#09172C' : '#FFFFFF'}
                          stroke={lineDimColor}
                          strokeWidth="1.5"
                          rx="3"
                        />
                        <text
                          x={dimX}
                          y={(topY + groundY) / 2 + 4}
                          textAnchor="middle"
                          fill={textPrimary}
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {engineering.totalAssembledHeightMm} MM
                        </text>
                      </g>
                    );
                  })()}

                  {/* Per-Tier Height Breakdowns (Left side) */}
                  {tierDrawData.items.map((item) => (
                    <g key={`dim-tier-${item.idx}`}>
                      <line
                        x1="320"
                        y1={item.drawTopY + 4}
                        x2="320"
                        y2={item.drawBottomY - 4}
                        stroke={lineDimColor}
                        strokeWidth="1.5"
                        markerStart="url(#workshop-arrow-start)"
                        markerEnd="url(#workshop-arrow-end)"
                      />
                      <text
                        x="310"
                        y={(item.drawTopY + item.drawBottomY) / 2 + 4}
                        textAnchor="end"
                        fill={lineDimColor}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {item.mod.externalHeightMm} mm
                      </text>
                    </g>
                  ))}
                </g>

                {/* LAYER 7: ISO / BS 8888 Technical Title Block */}
                <g id="layer-iso-title-block">
                  <rect
                    x={canvasWidth - 380}
                    y={canvasHeight - 110}
                    width="350"
                    height="80"
                    fill={isDark ? '#0F2342' : '#FFFFFF'}
                    stroke={isDark ? '#2176C7' : '#0F2342'}
                    strokeWidth="1.5"
                  />
                  <line
                    x1={canvasWidth - 380}
                    y1={canvasHeight - 85}
                    x2={canvasWidth - 30}
                    y2={canvasHeight - 85}
                    stroke={isDark ? 'rgba(33, 118, 199, 0.5)' : '#E2E8F0'}
                    strokeWidth="1"
                  />
                  <line
                    x1={canvasWidth - 380}
                    y1={canvasHeight - 55}
                    x2={canvasWidth - 30}
                    y2={canvasHeight - 55}
                    stroke={isDark ? 'rgba(33, 118, 199, 0.5)' : '#E2E8F0'}
                    strokeWidth="1"
                  />

                  {/* Title block content */}
                  <text
                    x={canvasWidth - 370}
                    y={canvasHeight - 93}
                    fill={textPrimary}
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    letterSpacing="0.08em"
                  >
                    STILLAGE STORAGE SOLUTIONS UK • WORKSHOP ASSEMBLY
                  </text>

                  <text
                    x={canvasWidth - 370}
                    y={canvasHeight - 70}
                    fill={lineDimColor}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    TIERS: {engineering.totalTiers} • ASSEMBLED HEIGHT: {engineering.totalAssembledHeightMm} MM
                  </text>

                  <text
                    x={canvasWidth - 370}
                    y={canvasHeight - 42}
                    fill={textMuted}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    SWL CAP: {engineering.totalSwlCapacityKg.toLocaleString()} KG • BASE COMPRESSION: {engineering.bottomUnitCompressionLoadKg.toLocaleString()} KG
                  </text>

                  <text
                    x={canvasWidth - 370}
                    y={canvasHeight - 34}
                    fill="#10B981"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    PUWER 1998 REG 6 &amp; BS 8888 CAD VERIFIED • UKCA CERTIFIED
                  </text>
                </g>
              </svg>
            </div>

            {/* Stage Bottom Bar: Status & Export Triggers */}
            <div className="px-4 py-2.5 bg-surface-sandLight border-t border-steel-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="text-steel-600">
                {exportStatus || 'Click any module on the canvas to inspect and configure.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportSvg}
                  className="px-2.5 py-1 bg-brand-navy hover:bg-brand-navyLight text-white font-bold rounded-sm inline-flex items-center gap-1.5 transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>Export .SVG</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPng}
                  className="px-2.5 py-1 border border-steel-300 hover:border-brand-navy bg-surface-white text-brand-navy font-bold rounded-sm inline-flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CAD .PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Engineering Verification & BOM / Checkout (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Engineering & PUWER Compliance Card */}
          <div className="bg-surface-white border border-steel-200 p-4 rounded-sm shadow-sm space-y-3">
            <div className="border-b border-steel-200 pb-2 flex items-center justify-between">
              <span className="font-display font-bold text-sm uppercase text-brand-navy flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-teal" />
                Structural Verification
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  engineering.isStackHeightCompliant && engineering.isClearanceCompliant
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {engineering.isStackHeightCompliant && engineering.isClearanceCompliant
                  ? 'COMPLIANT'
                  : 'ACTION REQ.'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-steel-100">
                <span className="text-steel-600">Footprint Interlock:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-steel-100">
                <span className="text-steel-600">Max Certified Tiers:</span>
                <span className="font-bold text-brand-navy">
                  {tiers.length} of {engineering.maxCertifiedTiers} Allowed
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-steel-100">
                <span className="text-steel-600">Base Post Compression:</span>
                <span className="font-bold text-brand-navy">
                  {engineering.bottomUnitCompressionLoadKg.toLocaleString()} kg
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-steel-100">
                <span className="text-steel-600">Combined Tare Weight:</span>
                <span className="font-bold text-brand-navy">{engineering.totalTareWeightKg} kg</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-steel-600">Aspect Ratio / CoG:</span>
                <span
                  className={`font-bold ${
                    engineering.stabilityRating === 'optimal'
                      ? 'text-emerald-700'
                      : engineering.stabilityRating === 'moderate'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {engineering.centerOfGravityRatio}:1 ({engineering.stabilityRating})
                </span>
              </div>
            </div>

            {/* Warnings Alert */}
            {engineering.safetyWarnings.length > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-sm text-xs font-mono text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Engineering Notice:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed">
                  {engineering.safetyWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bill of Materials (BOM) & Quote / Checkout Card */}
          <div className="bg-surface-white border border-steel-200 p-4 rounded-sm shadow-sm space-y-4">
            <div className="border-b border-steel-200 pb-2">
              <span className="font-mono text-[10px] text-stillage-blue font-bold uppercase tracking-wider">
                Bill of Materials &amp; Pricing
              </span>
              <h3 className="font-display font-bold text-base uppercase text-brand-navy">
                Assembled Stack Fleet
              </h3>
            </div>

            {/* Itemised Tiers */}
            <div className="space-y-1.5 text-xs font-mono max-h-48 overflow-y-auto divide-y divide-steel-100">
              {bomItems.map((item, idx) => (
                <div key={idx} className="pt-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-brand-navy block truncate">
                      T{idx + 1}: {item.mod.sku}
                    </span>
                    <span className="text-[10px] text-steel-500 block truncate">
                      {item.tier.finishOption} • {idx === 0 ? item.tier.mobilityOption : 'feet'}
                    </span>
                  </div>
                  <span className="font-bold text-stillage-blue shrink-0">
                    {formatPrice(item.unitConfiguredPence)}
                  </span>
                </div>
              ))}
            </div>

            {/* Stack Multiplier Selector */}
            <div className="pt-2 border-t border-steel-200">
              <label className="block text-xs font-mono font-bold text-brand-navy mb-1.5">
                Number of Identical Stacks Needed:
              </label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                {[1, 2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStackMultiplier(num)}
                    className={`py-1.5 rounded-sm border font-bold text-center transition-colors ${
                      stackMultiplier === num
                        ? 'bg-stillage-blue text-white border-stillage-blue'
                        : 'bg-surface-sandLight hover:bg-surface-sand text-brand-navy border-steel-300'
                    }`}
                  >
                    {num} {num === 1 ? 'Stack' : 'Stacks'}
                  </button>
                ))}
              </div>

              {bulkDiscountPct > 0 && (
                <div className="mt-2 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 p-2 rounded-sm border border-emerald-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Bulk Tier Qualified: {bulkDiscountPct}% Discount on {totalFleetUnits} Total Units!
                  </span>
                </div>
              )}
            </div>

            {/* Price Total */}
            <div className="pt-2 border-t border-steel-200 font-mono">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-steel-600">
                  Total ({totalFleetUnits} units across {stackMultiplier} stack{stackMultiplier > 1 ? 's' : ''}):
                </span>
                <div className="text-right">
                  <div className="text-lg font-bold text-brand-navy">
                    {formatBothPrices(totalFleetExVatPence).primary}
                  </div>
                  <div className="text-[11px] text-steel-600">
                    {formatBothPrices(totalFleetExVatPence).label}
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Basket CTA */}
            <button
              type="button"
              onClick={handleAddConfigurationToBasket}
              className="w-full bg-stillage-blue hover:bg-brand-navy text-white font-display font-bold uppercase tracking-wider py-3 px-4 rounded-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Assembly to Quote / Basket</span>
            </button>

            {basketToast && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-sm text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>{basketToast}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD MODULE MODAL / DRAWER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-white border-2 border-brand-navy rounded-sm max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-steel-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-stillage-blue uppercase">
                  Compatible Modules
                </span>
                <h3 className="font-display font-bold text-lg uppercase text-brand-navy">
                  Add Stillage Module to Stack
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-steel-500 hover:text-brand-navy font-mono text-sm px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-steel-600 font-mono">
              Displaying modules compatible with the{' '}
              <strong className="text-brand-navy">{activeFootprint}</strong> stacking cup footprint.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {compatibleModules.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => handleAddModule(mod)}
                  className="border border-steel-200 p-3 rounded-sm hover:border-stillage-blue hover:bg-surface-sandLight cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={mod.primaryImage}
                      alt={mod.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain bg-surface-sand p-1 rounded border border-steel-200"
                    />
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] text-stillage-blue font-bold">
                        {mod.sku}
                      </div>
                      <div className="font-display font-bold text-xs uppercase text-brand-navy truncate">
                        {mod.name}
                      </div>
                      <div className="font-mono text-[10px] text-steel-600">
                        {mod.externalHeightMm} mm • {mod.unitWeightKg} kg
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-steel-100 font-mono text-xs">
                    <span className="font-bold text-brand-navy">{formatPrice(mod.basePriceExVatPence)}</span>
                    <span className="text-stillage-blue font-bold text-[11px]">+ Add to Stack</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
