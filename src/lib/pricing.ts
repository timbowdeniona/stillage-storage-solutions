import { QuoteRequest, QuoteResponse } from '@/types/catalog';

export const UK_VAT_RATE = 0.2;

export function getFinishModifierPence(finishOption: string): number {
  switch (finishOption) {
    case 'raw-steel':
      return -1000;
    case 'galvanised':
      return 4500;
    case 'custom-ral':
      return 2500;
    default:
      return 0;
  }
}

export function getMobilityModifierPence(mobilityOption: string): number {
  switch (mobilityOption) {
    case 'heavy-duty-castors':
      return 5500;
    case 'forklift-pockets':
      return 3000;
    case 'both-castors-pockets':
      return 8000;
    default:
      return 0;
  }
}

export function getBulkDiscountPercentage(quantity: number): number {
  if (quantity >= 10) return 10;
  if (quantity >= 5) return 5;
  return 0;
}

export function calculatePalletDelivery(
  postcode: string | undefined,
  quantity: number,
  requiresTailLift: boolean
): {
  palletCount: number;
  deliveryZone: string;
  deliveryExVatPence: number;
  tailLiftSurchargePence: number;
} {
  const safeQty = Math.max(1, quantity);
  const palletCount = Math.floor((safeQty - 1) / 4) + 1;
  const normalized = (postcode || '').trim().toUpperCase();

  let deliveryZone = 'UK Mainland Standard Pallet Network (Zone B)';
  let ratePerPalletPence = 7900;

  if (
    normalized.startsWith('AB') ||
    normalized.startsWith('IV') ||
    normalized.startsWith('KW') ||
    normalized.startsWith('PH') ||
    normalized.startsWith('PA')
  ) {
    deliveryZone = 'Scottish Highlands & Grampian (Zone C)';
    ratePerPalletPence = 11500;
  } else if (
    normalized.startsWith('BT') ||
    normalized.startsWith('IM') ||
    normalized.startsWith('PO3')
  ) {
    deliveryZone = 'Offshore / NI / Islands (Zone D)';
    ratePerPalletPence = 14500;
  } else if (
    normalized.startsWith('LL') ||
    normalized.startsWith('CH') ||
    normalized.startsWith('SY') ||
    normalized.startsWith('CW') ||
    normalized.startsWith('WA') ||
    normalized.startsWith('M') ||
    normalized.startsWith('L')
  ) {
    deliveryZone = 'North West & Wales Hub (Zone A)';
    ratePerPalletPence = 6500;
  }

  const tailLiftSurchargePence = requiresTailLift ? 1500 : 0;
  const deliveryExVatPence = palletCount * ratePerPalletPence + tailLiftSurchargePence;

  return {
    palletCount,
    deliveryZone,
    deliveryExVatPence,
    tailLiftSurchargePence,
  };
}

export function calculateQuote(req: QuoteRequest): QuoteResponse {
  const quantity = Math.max(1, Math.floor(req.quantity || 1));
  const finishModifierPence = getFinishModifierPence(req.finishOption);
  const mobilityModifierPence = getMobilityModifierPence(req.mobilityOption);
  const configuredUnitExVatPence = Math.max(
    1000,
    req.basePriceExVatPence + finishModifierPence + mobilityModifierPence
  );

  const discountPercentage = getBulkDiscountPercentage(quantity);
  const discountedUnitExVatPence = Math.round(
    configuredUnitExVatPence * (1 - discountPercentage / 100)
  );

  const rawSubtotal = configuredUnitExVatPence * quantity;
  const lineSubtotalExVatPence = discountedUnitExVatPence * quantity;
  const bulkSavingsExVatPence = rawSubtotal - lineSubtotalExVatPence;

  const { palletCount, deliveryZone, deliveryExVatPence, tailLiftSurchargePence } =
    calculatePalletDelivery(req.postcode, quantity, req.requiresTailLift);

  const totalExVatPence = lineSubtotalExVatPence + deliveryExVatPence;
  const vatAmountPence = Math.round(totalExVatPence * UK_VAT_RATE);
  const totalIncVatPence = totalExVatPence + vatAmountPence;

  return {
    sku: req.sku,
    quantity,
    baseUnitPence: req.basePriceExVatPence,
    finishModifierPence,
    mobilityModifierPence,
    configuredUnitExVatPence,
    discountPercentage,
    discountedUnitExVatPence,
    lineSubtotalExVatPence,
    bulkSavingsExVatPence,
    palletCount,
    deliveryZone,
    deliveryExVatPence,
    tailLiftSurchargePence,
    totalExVatPence,
    vatAmountPence,
    totalIncVatPence,
    engine: 'stillage-rust-parity-v1',
  };
}
