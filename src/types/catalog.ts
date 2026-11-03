export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  badgeText?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  categorySlug: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  basePriceExVatPence: number;
  swlKg: number;
  externalLengthMm: number;
  externalWidthMm: number;
  externalHeightMm: number;
  unitWeightKg: number;
  stackableHeight: string;
  steelSpecification: string;
  standardFinish: string;
  ukcaCertified: boolean;
  inStock: boolean;
  leadTimeText: string;
  featured: boolean;
  primaryImage: string;
  secondaryImage?: string;
  backdropStyle: 'sand' | 'white';
  highlights: string[];
}

export interface FinishOption {
  id: 'standard-blue' | 'raw-steel' | 'galvanised' | 'custom-ral';
  name: string;
  code: string;
  swatchHex: string;
  priceModifierPence: number;
  leadTimeNote: string;
}

export interface MobilityOption {
  id: 'standard-feet' | 'heavy-duty-castors' | 'forklift-pockets' | 'both-castors-pockets';
  name: string;
  description: string;
  priceModifierPence: number;
}

export interface QuoteRequest {
  sku: string;
  basePriceExVatPence: number;
  quantity: number;
  finishOption: string;
  mobilityOption: string;
  postcode?: string;
  requiresTailLift: boolean;
}

export interface QuoteResponse {
  sku: string;
  quantity: number;
  baseUnitPence: number;
  finishModifierPence: number;
  mobilityModifierPence: number;
  configuredUnitExVatPence: number;
  discountPercentage: number;
  discountedUnitExVatPence: number;
  lineSubtotalExVatPence: number;
  bulkSavingsExVatPence: number;
  palletCount: number;
  deliveryZone: string;
  deliveryExVatPence: number;
  tailLiftSurchargePence: number;
  totalExVatPence: number;
  vatAmountPence: number;
  totalIncVatPence: number;
  engine: string;
}
