import {
  FootprintFamilyId,
  StackEngineeringSummary,
  WorkshopModuleDef,
  WorkshopPreset,
  WorkshopStackTier,
} from '@/types/catalog';

export const WORKSHOP_MODULE_CATALOG: WorkshopModuleDef[] = [
  // 1200 x 1000 mm Euro/UK Footprint Family
  {
    id: 'mod-msh-1210hd',
    sku: 'SSS-MSH-1210HD',
    name: 'Mesh Sided Half-Drop Gate Stillage Cage',
    footprintFamily: 'euro-uk-1210',
    moduleRole: 'standard-cage',
    lengthMm: 1200,
    widthMm: 1000,
    externalHeightMm: 900,
    effectiveStackedHeightMm: 870,
    cupEngagementMm: 30,
    unitWeightKg: 59,
    swlKg: 1000,
    maxStackTiers: 4,
    basePriceExVatPence: 17400,
    primaryImage: '/images/products/cantilever-rack-sand.png',
    description:
      '50x50x4mm welded mesh stillage cage with fold-down half-front gate for accessible stock picking while stacked.',
    highlights: [
      'Ergonomic half-drop front gate for access when stacked',
      'Pressed pyramid feet lock into top receiver cups',
      '1,000 kg SWL per tier — tested for 4-high vertical stacking',
    ],
    allowMobilityOptions: true,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },
  {
    id: 'mod-sht-1210',
    sku: 'SSS-SHT-1210',
    name: 'Heavy-Duty Solid Sheet Steel Bin Stillage',
    footprintFamily: 'euro-uk-1210',
    moduleRole: 'standard-cage',
    lengthMm: 1200,
    widthMm: 1000,
    externalHeightMm: 900,
    effectiveStackedHeightMm: 870,
    cupEngagementMm: 30,
    unitWeightKg: 68,
    swlKg: 1000,
    maxStackTiers: 4,
    basePriceExVatPence: 18900,
    primaryImage: '/images/products/stacked-hopper-stillage.png',
    description:
      '2mm corrugated sheet steel bin stillage for heavy castings, foundry WIP, and loose scrap metal.',
    highlights: [
      'Corrugated structural sheet steel containment',
      'Fully welded 50x50x3mm box section corner posts',
      'Stacks seamlessly with mesh sided cages on 1200x1000 footprint',
    ],
    allowMobilityOptions: true,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },

  // 1120 x 1120 mm Bulk Bag Hopper Family (BBFH2-1)
  {
    id: 'mod-bbfh-stand',
    sku: 'BBFH2-1-STAND',
    name: 'BBFH 1250mm Heavy-Duty Box-Section Support Stand',
    footprintFamily: 'bulk-hopper-1111',
    moduleRole: 'base-stand',
    lengthMm: 1120,
    widthMm: 1120,
    externalHeightMm: 1250,
    effectiveStackedHeightMm: 1250,
    cupEngagementMm: 0,
    unitWeightKg: 78,
    swlKg: 1000,
    maxStackTiers: 2,
    basePriceExVatPence: 24500,
    primaryImage: '/images/products/base-render-bbfh2-1.jpg',
    description:
      '1250mm tall heavy-duty 50x50mm box-section stand with 1080mm foot centres, bag loop hooks, and self-centring receiver cups.',
    highlights: [
      '1250mm discharge clearance for standard FIBC bulk bags',
      '1080mm centre-to-centre stacking cup receivers',
      'Available with captive 165x75mm forklift pockets or castors',
    ],
    allowMobilityOptions: true,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },
  {
    id: 'mod-bbfh-hopper',
    sku: 'BBFH2-1-HOPPER',
    name: 'BBFH 600mm Modular Top Hopper (Flush 200x200mm Opening)',
    footprintFamily: 'bulk-hopper-1111',
    moduleRole: 'top-hopper',
    lengthMm: 1120,
    widthMm: 1120,
    externalHeightMm: 600,
    effectiveStackedHeightMm: 570,
    cupEngagementMm: 30,
    unitWeightKg: 54,
    swlKg: 1000,
    maxStackTiers: 2,
    basePriceExVatPence: 22000,
    primaryImage: '/images/products/base-render-bbfh2-1.jpg',
    description:
      'Two-stage hopper unit (450mm funnel cone + 150mm upper collar) tapering to a flush 200x200mm gravity discharge aperture.',
    highlights: [
      'Flush 200x200mm discharge aperture with no chute snag',
      '30x30mm vertical support struts and pressed corner feet',
      'Modular 4-corner cup engagement onto BBFH stand',
    ],
    allowMobilityOptions: false,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },

  // 1200 x 1200 mm Modular Hopper & Tower Family (SSS-HOP-4T1000)
  {
    id: 'mod-hop-tower-bin',
    sku: 'SSS-HOP-BIN',
    name: 'Modular 1200mm Interlocking Bin Tier',
    footprintFamily: 'modular-tower-1212',
    moduleRole: 'intermediate-tier',
    lengthMm: 1200,
    widthMm: 1200,
    externalHeightMm: 650,
    effectiveStackedHeightMm: 620,
    cupEngagementMm: 30,
    unitWeightKg: 42,
    swlKg: 1000,
    maxStackTiers: 4,
    basePriceExVatPence: 13500,
    primaryImage: '/images/products/stacked-hopper-stillage.png',
    description:
      'Interlocking bin module with pressed corner pyramid feet and internal funnel guide plates.',
    highlights: [
      'Self-centring pressed steel pyramid stacking feet',
      'Modular vertical connection for granular feed systems',
      '1,000 kg SWL per tier',
    ],
    allowMobilityOptions: true,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },
  {
    id: 'mod-hop-tower-top',
    sku: 'SSS-HOP-TOP',
    name: 'Top Feed Conical Gravity Hopper with Safety Mesh Enclosure',
    footprintFamily: 'modular-tower-1212',
    moduleRole: 'top-hopper',
    lengthMm: 1200,
    widthMm: 1200,
    externalHeightMm: 700,
    effectiveStackedHeightMm: 670,
    cupEngagementMm: 30,
    unitWeightKg: 48,
    swlKg: 1000,
    maxStackTiers: 4,
    basePriceExVatPence: 14500,
    primaryImage: '/images/products/stacked-hopper-stillage.png',
    description:
      'Top conical hopper with perimeter mesh debris guard for continuous aggregate or pellet loading.',
    highlights: [
      'Conical hopper cone with upper safety mesh enclosure',
      'Interlocks securely onto modular intermediate bin tiers',
      'Removable access hatch for inspection and cleaning',
    ],
    allowMobilityOptions: false,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },

  // 1130 x 1130 mm Post Pallet Family (SSS-PST-1111D)
  {
    id: 'mod-pst-1111d',
    sku: 'SSS-PST-1111D',
    name: 'Heavy-Duty Demountable Post Pallet (1050mm Posts)',
    footprintFamily: 'post-pallet-1111',
    moduleRole: 'post-pallet',
    lengthMm: 1130,
    widthMm: 1130,
    externalHeightMm: 1050,
    effectiveStackedHeightMm: 1015,
    cupEngagementMm: 35,
    unitWeightKg: 46,
    swlKg: 1000,
    maxStackTiers: 5,
    basePriceExVatPence: 14200,
    primaryImage: '/images/products/cantilever-rack-cutout.png',
    description:
      '4 removable 60x60mm vertical corner posts with oversized flared stacking cups rated for 5-high vertical stacking.',
    highlights: [
      'Flared stacking cups for rapid forklift positioning',
      'Demountable posts nest on deck when empty (4:1 return ratio)',
      'Certified for 5-high vertical stacking (5,000 kg total stack load)',
    ],
    allowMobilityOptions: true,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },

  // Cantilever Racks (Side-by-Side Workshop Runs)
  {
    id: 'mod-cant-3b8a',
    sku: 'SSS-CANT-3B8A',
    name: '3-Bay Double-Sided Heavy Duty Cantilever Bar Stillage',
    footprintFamily: 'cantilever-bay',
    moduleRole: 'cantilever',
    lengthMm: 2400,
    widthMm: 1100,
    externalHeightMm: 1450,
    effectiveStackedHeightMm: 1450,
    cupEngagementMm: 0,
    unitWeightKg: 118,
    swlKg: 1500,
    maxStackTiers: 1,
    basePriceExVatPence: 38500,
    primaryImage: '/images/products/cantilever-rack-cutout.png',
    description:
      'Triple-upright 2400mm long double-sided cantilever stillage with 4 arm tiers for bar, pipe, and tube stock.',
    highlights: [
      '24 individual load arms with welded anti-roll safety end lugs',
      'Full perimeter forklift skid base for 4-way handling',
      '1,500 kg Safe Working Load',
    ],
    allowMobilityOptions: true,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },
  {
    id: 'mod-cant-2b4a',
    sku: 'SSS-CANT-2B4A',
    name: '2-Bay Compact Cantilever Bar & Tube Stillage',
    footprintFamily: 'cantilever-bay',
    moduleRole: 'cantilever',
    lengthMm: 1800,
    widthMm: 1050,
    externalHeightMm: 1400,
    effectiveStackedHeightMm: 1400,
    cupEngagementMm: 0,
    unitWeightKg: 86,
    swlKg: 1200,
    maxStackTiers: 1,
    basePriceExVatPence: 29500,
    primaryImage: '/images/products/cantilever-rack-sand.png',
    description:
      'Twin-upright 1800mm compact cantilever stillage engineered for workshop saw stations and CNC machine feeds.',
    highlights: [
      'Compact 1800mm length fits saw infeed zones and vans',
      '16 double-sided arms with retaining lugs',
      '1,200 kg Safe Working Load',
    ],
    allowMobilityOptions: true,
    availableFinishes: ['standard-blue', 'raw-steel', 'galvanised', 'custom-ral'],
  },
];

export const WORKSHOP_PRESETS: WorkshopPreset[] = [
  {
    id: 'preset-mesh-picking-4high',
    title: '4-High Order Picking Mesh Tower',
    subtitle: '1200 × 1000 mm Euro/UK Footprint • Half-Drop Front Gates',
    footprintFamily: 'euro-uk-1210',
    description:
      'High-density 4-high picking stack with fold-down front gates. Enables manual component picking from lower tiers while fully loaded.',
    recommendedIndustry: 'Automotive WIP & Order Fulfillment Hubs',
    defaultClearanceMm: 3600,
    tiers: [
      {
        moduleId: 'mod-msh-1210hd',
        tierIndex: 0,
        finishOption: 'standard-blue',
        mobilityOption: 'forklift-pockets',
        customLabel: 'Tier 1 (Base): Half-Drop Mesh Cage with Enclosed Forklift Pockets',
      },
      {
        moduleId: 'mod-msh-1210hd',
        tierIndex: 1,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 2: Half-Drop Mesh Cage (Ergonomic Picking Height)',
      },
      {
        moduleId: 'mod-msh-1210hd',
        tierIndex: 2,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 3: Half-Drop Mesh Cage (Mid Storage)',
      },
      {
        moduleId: 'mod-msh-1210hd',
        tierIndex: 3,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 4 (Top): Half-Drop Mesh Cage (Bulk Reserve)',
      },
    ],
  },
  {
    id: 'preset-bbfh2-1-bulk-bag',
    title: 'BBFH2-1 Bulk Bag Filling Hopper Assembly',
    subtitle: '1120 × 1120 mm Modular Stand & Funnel • 1850 mm Footprint',
    footprintFamily: 'bulk-hopper-1111',
    description:
      '1250mm support stand with bag loop hooks topped by the 600mm conical hopper unit with flush 200x200mm gravity opening.',
    recommendedIndustry: 'Bulk Aggregate, Seeds, Plastics & FIBC Packing',
    defaultClearanceMm: 2800,
    tiers: [
      {
        moduleId: 'mod-bbfh-stand',
        tierIndex: 0,
        finishOption: 'standard-blue',
        mobilityOption: 'forklift-pockets',
        customLabel: 'Base Stand: 1250mm Box-Section Stand with 1080mm Foot Centres',
      },
      {
        moduleId: 'mod-bbfh-hopper',
        tierIndex: 1,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: 'Top Unit: 600mm Funnel Hopper (200x200mm Bottom Opening)',
      },
    ],
  },
  {
    id: 'preset-hopper-tower-4tier',
    title: 'Modular 4-Tier Aggregate Hopper Feed Tower',
    subtitle: '1200 × 1200 mm Multi-Tier Tower • Top Feed Conical Hopper',
    footprintFamily: 'modular-tower-1212',
    description:
      'Self-centring interlocking tower with 3 intermediate steel bin modules topped with a conical feed hopper and safety mesh guard.',
    recommendedIndustry: 'Continuous Material Infeed & Granular Storage',
    defaultClearanceMm: 3200,
    tiers: [
      {
        moduleId: 'mod-hop-tower-bin',
        tierIndex: 0,
        finishOption: 'standard-blue',
        mobilityOption: 'forklift-pockets',
        customLabel: 'Tier 1 (Base): 1200mm Bin Module with Forklift Hoops',
      },
      {
        moduleId: 'mod-hop-tower-bin',
        tierIndex: 1,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 2: 1200mm Intermediate Stacking Bin',
      },
      {
        moduleId: 'mod-hop-tower-bin',
        tierIndex: 2,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 3: 1200mm Intermediate Stacking Bin',
      },
      {
        moduleId: 'mod-hop-tower-top',
        tierIndex: 3,
        finishOption: 'standard-blue',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 4 (Top): Conical Gravity Feed Hopper + Safety Mesh',
      },
    ],
  },
  {
    id: 'preset-post-pallet-5high',
    title: '5-High Demountable Post Pallet Yard Stack',
    subtitle: '1130 × 1130 mm Footprint • Hot-Dip Galvanised (BS EN ISO 1461)',
    footprintFamily: 'post-pallet-1111',
    description:
      'Heavy-duty flared stacking cup post pallets configured 5-high for outdoor timber, scaffold tube, or pipe storage.',
    recommendedIndustry: 'Scaffolding, Timber Merchants & Construction Depots',
    defaultClearanceMm: 5500,
    tiers: [
      {
        moduleId: 'mod-pst-1111d',
        tierIndex: 0,
        finishOption: 'galvanised',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 1 (Base): Galvanised Post Pallet (Oversized Feet)',
      },
      {
        moduleId: 'mod-pst-1111d',
        tierIndex: 1,
        finishOption: 'galvanised',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 2: Galvanised Post Pallet',
      },
      {
        moduleId: 'mod-pst-1111d',
        tierIndex: 2,
        finishOption: 'galvanised',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 3: Galvanised Post Pallet',
      },
      {
        moduleId: 'mod-pst-1111d',
        tierIndex: 3,
        finishOption: 'galvanised',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 4: Galvanised Post Pallet',
      },
      {
        moduleId: 'mod-pst-1111d',
        tierIndex: 4,
        finishOption: 'galvanised',
        mobilityOption: 'standard-feet',
        customLabel: 'Tier 5 (Top): Galvanised Post Pallet',
      },
    ],
  },
];

export function getWorkshopModuleById(id: string): WorkshopModuleDef | undefined {
  return WORKSHOP_MODULE_CATALOG.find((m) => m.id === id);
}

export function getWorkshopModuleBySku(sku: string): WorkshopModuleDef | undefined {
  const normalized = sku.toUpperCase().trim();
  return WORKSHOP_MODULE_CATALOG.find(
    (m) =>
      m.sku.toUpperCase() === normalized ||
      m.sku.toUpperCase().includes(normalized) ||
      normalized.includes(m.sku.toUpperCase())
  );
}

export function validateStackConfiguration(
  tiers: WorkshopStackTier[],
  clearanceLimitMm: number = 3200
): StackEngineeringSummary {
  if (tiers.length === 0) {
    return {
      totalTiers: 0,
      totalAssembledHeightMm: 0,
      totalTareWeightKg: 0,
      totalSwlCapacityKg: 0,
      bottomUnitCompressionLoadKg: 0,
      maxCertifiedTiers: 4,
      isStackHeightCompliant: true,
      isClearanceCompliant: true,
      clearanceMarginMm: clearanceLimitMm,
      footprintConsistent: true,
      centerOfGravityRatio: 0,
      stabilityRating: 'optimal',
      safetyWarnings: ['No modules added to the configuration stack yet.'],
      safetyCertifications: ['BS 8888 CAD Compliant', 'PUWER 1998 Verified'],
    };
  }

  const moduleList = tiers.map((t) => getWorkshopModuleById(t.moduleId) || WORKSHOP_MODULE_CATALOG[0]);
  const baseModule = moduleList[0];
  const baseTier = tiers[0];

  // Footprint check
  const footprintConsistent = moduleList.every(
    (m) => m.footprintFamily === baseModule.footprintFamily
  );

  // Height calculation with cup engagement
  let totalHeightMm = 0;
  for (let i = 0; i < moduleList.length; i++) {
    const mod = moduleList[i];
    if (i === 0) {
      totalHeightMm += mod.externalHeightMm;
      // Add base mobility offset
      if (
        baseTier.mobilityOption === 'heavy-duty-castors' ||
        baseTier.mobilityOption === 'both-castors-pockets'
      ) {
        totalHeightMm += 160; // 150mm polyurethane castors + mounting pad
      } else if (
        baseTier.mobilityOption === 'forklift-pockets' &&
        mod.moduleRole !== 'base-stand' &&
        mod.moduleRole !== 'cantilever'
      ) {
        totalHeightMm += 75; // underslung 75mm captive channels
      }
    } else {
      totalHeightMm += mod.effectiveStackedHeightMm;
    }
  }

  const totalTareWeightKg = moduleList.reduce((acc, m) => acc + m.unitWeightKg, 0);
  const totalSwlCapacityKg = moduleList.reduce((acc, m) => acc + m.swlKg, 0);

  // Compression load on Tier 0 corner stanchions (supported weight from tiers above)
  const tiersAbove = moduleList.slice(1);
  const tareAboveKg = tiersAbove.reduce((acc, m) => acc + m.unitWeightKg, 0);
  const payloadAboveKg = tiersAbove.reduce((acc, m) => acc + m.swlKg, 0);
  const bottomUnitCompressionLoadKg = baseModule.unitWeightKg + tareAboveKg + payloadAboveKg;

  const maxCertifiedTiers = Math.min(...moduleList.map((m) => m.maxStackTiers));
  const isStackHeightCompliant = tiers.length <= maxCertifiedTiers;
  const isClearanceCompliant = totalHeightMm <= clearanceLimitMm;
  const clearanceMarginMm = clearanceLimitMm - totalHeightMm;

  // Aspect ratio (height / width)
  const minBaseDimension = Math.min(baseModule.lengthMm, baseModule.widthMm);
  const centerOfGravityRatio = Number((totalHeightMm / Math.max(1, minBaseDimension)).toFixed(2));

  let stabilityRating: 'optimal' | 'moderate' | 'exceeds-recommended' = 'optimal';
  if (centerOfGravityRatio > 2.5) {
    stabilityRating = 'exceeds-recommended';
  } else if (centerOfGravityRatio > 1.8) {
    stabilityRating = 'moderate';
  }

  const safetyWarnings: string[] = [];
  if (!footprintConsistent) {
    safetyWarnings.push(
      'Mismatched footprint families detected: do not stack modules with differing stacking cup centres.'
    );
  }
  if (!isStackHeightCompliant) {
    safetyWarnings.push(
      `Exceeds maximum certified stack height of ${maxCertifiedTiers} tiers under PUWER Regulation 6.`
    );
  }
  if (!isClearanceCompliant) {
    safetyWarnings.push(
      `Total stack height (${totalHeightMm} mm) exceeds the selected clearance line (${clearanceLimitMm} mm) by ${Math.abs(clearanceMarginMm)} mm.`
    );
  }
  if (stabilityRating === 'exceeds-recommended') {
    safetyWarnings.push(
      `Vertical aspect ratio (${centerOfGravityRatio}:1) is high. Ensure level concrete ground and avoid forklift transit when stacked.`
    );
  }

  // Check top-hopper placement
  const topHopperIdx = moduleList.findIndex((m) => m.moduleRole === 'top-hopper');
  if (topHopperIdx !== -1 && topHopperIdx !== moduleList.length - 1) {
    safetyWarnings.push(
      'Conical hopper unit should be positioned on the top tier of the assembly for gravity feed.'
    );
  }

  // Base stand placement
  const standIdx = moduleList.findIndex((m) => m.moduleRole === 'base-stand');
  if (standIdx !== -1 && standIdx !== 0) {
    safetyWarnings.push('Support stand must be positioned on Tier 1 (ground base).');
  }

  const safetyCertifications = [
    'BS 8888:2020 Technical Drawing Standards',
    'PUWER 1998 Regulation 6 Stack Integrity',
    'BS EN 10219 S275J2H Structural Steel Tested',
    'UKCA Certified Welded Assembly',
  ];

  return {
    totalTiers: tiers.length,
    totalAssembledHeightMm: totalHeightMm,
    totalTareWeightKg,
    totalSwlCapacityKg,
    bottomUnitCompressionLoadKg,
    maxCertifiedTiers,
    isStackHeightCompliant,
    isClearanceCompliant,
    clearanceMarginMm,
    footprintConsistent,
    centerOfGravityRatio,
    stabilityRating,
    safetyWarnings,
    safetyCertifications,
  };
}
