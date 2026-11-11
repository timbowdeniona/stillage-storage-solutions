import blueprintSpecsJson from './blueprint-specs.json';
import { BlueprintAnnotationSpec, Product } from '@/types/catalog';

export const BLUEPRINT_CANVAS_SIZE = blueprintSpecsJson.canvas;

export const EDITABLE_BLUEPRINT_PRESETS: Record<string, BlueprintAnnotationSpec> =
  blueprintSpecsJson.presets as unknown as Record<string, BlueprintAnnotationSpec>;

export function getBlueprintSpecForProduct(product: Product): BlueprintAnnotationSpec {
  const preset = EDITABLE_BLUEPRINT_PRESETS[product.sku];
  if (preset) {
    return JSON.parse(JSON.stringify(preset));
  }

  return {
    sku: product.sku,
    productTitle: product.title,
    baseRenderUrl: product.primaryImage,
    dimensions: [
      {
        id: 'dim-auto-height',
        label: `${product.externalHeightMm} mm (Height)`,
        x1: 200,
        y1: 160,
        x2: 200,
        y2: 640,
        extX1: 280,
        extY1: 160,
        extX2: 280,
        extY2: 640,
        color: 'primary',
      },
      {
        id: 'dim-auto-length',
        label: `${product.externalLengthMm} mm (Length)`,
        x1: 280,
        y1: 720,
        x2: 820,
        y2: 720,
        extX1: 280,
        extY1: 640,
        extX2: 820,
        extY2: 640,
        color: 'primary',
      },
      {
        id: 'dim-auto-width',
        label: `${product.externalWidthMm} mm (Width)`,
        x1: 850,
        y1: 700,
        x2: 960,
        y2: 600,
        extX1: 820,
        extY1: 640,
        extX2: 920,
        extY2: 560,
        color: 'amber',
      },
    ],
    callouts: [
      {
        id: 'callout-auto-steel',
        title: 'Steel Section Gauge:',
        detail: product.steelSpecification,
        targetX: 440,
        targetY: 260,
        elbowX: 340,
        elbowY: 140,
        boxX: 80,
        boxY: 118,
        color: 'teal',
      },
      {
        id: 'callout-auto-stack',
        title: `Stacking: ${product.stackableHeight}`,
        detail: `Rated to ${product.swlKg} kg SWL UDL`,
        targetX: 740,
        targetY: 360,
        elbowX: 900,
        elbowY: 300,
        boxX: 920,
        boxY: 278,
        color: 'amber',
      },
    ],
    titleBlock: {
      companyName: 'STILLAGE STORAGE SOLUTIONS',
      drawingTitle: product.title.toUpperCase(),
      sku: `SKU: ${product.sku}`,
      dimensionsSummary: `FOOTPRINT: ${product.externalLengthMm} x ${product.externalWidthMm} x ${product.externalHeightMm} MM`,
      swlSummary: `SWL: ${product.swlKg.toLocaleString('en-GB')} KG | TARE: ${product.unitWeightKg} KG`,
      certificationText: 'MADE IN BRITAIN | UKCA CERTIFIED',
    },
  };
}
