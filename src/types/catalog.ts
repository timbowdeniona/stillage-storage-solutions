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

export interface AlgoliaProductRecord extends Product {
  objectID: string;
  footprintMm: string;
  dimensionsText: string;
  compatibleSkus: string[];
  useCases: string[];
  environmentTags: string[];
  recommendedFinishIds: string[];
  recommendedMobilityIds: string[];
}

export interface ProductRecommendation {
  product: Product;
  relationship: 'compatible-equipment' | 'similar-specification';
  matchReason: string;
  score: number;
  suggestedConfig?: {
    finishOption?: string;
    mobilityOption?: string;
    quantity?: number;
    note?: string;
  };
}

export interface ProductRecommendationsResult {
  compatibleEquipment: ProductRecommendation[];
  similarSpecifications: ProductRecommendation[];
  engine: 'algolia-recommend' | 'algolia-dsn-scored' | 'algolia-local-replica';
}

export interface ParsedSearchIntent {
  cleanedQuery: string;
  detectedMinSwlKg?: number;
  detectedFootprintMm?: string;
  detectedCategorySlug?: string;
  suggestedFinishOption?: string;
  suggestedMobilityOption?: string;
  intentBadges: string[];
}

export interface AiSpecAdvisorRequest {
  prompt: string;
  environment?: 'indoor' | 'outdoor' | 'foundry';
  handling?: 'forklift' | 'telehandler' | 'castors' | 'crane';
  targetSwlKg?: number;
}

export interface BespokeCadBrief {
  referenceCode: string;
  suggestedDimensionsMm: string;
  targetSwlKg: number;
  recommendedSteelGauge: string;
  recommendedFinish: string;
  complianceStandard: string;
  engineeringSummary: string;
}

export interface AiSpecAdvisorResponse {
  model: string;
  engine: 'gemini-3.8-flash-algolia-rag' | 'algolia-rag-engineering-engine';
  executiveSummary: string;
  primaryRecommendation: {
    product: Product;
    finishOption: string;
    finishName: string;
    mobilityOption: string;
    mobilityName: string;
    recommendedQuantity: number;
    rationale: string;
    complianceNote: string;
    configuratorUrl: string;
  };
  complementaryFleet: ProductRecommendation[];
  palletOptimizationTip: string;
  bespokeCadBrief: BespokeCadBrief;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readingTimeMinutes: number;
  featured: boolean;
  heroImage: string;
  backdropStyle: 'sand' | 'white';
  tags: string[];
  keyTakeaways: string[];
  body: string;
  relatedProductSkus: string[];
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

export interface CheckoutLineItemInput {
  sku: string;
  title: string;
  slug?: string;
  basePriceExVatPence: number;
  quantity: number;
  finishOption: string;
  finishName?: string;
  mobilityOption: string;
  mobilityName?: string;
  primaryImage?: string;
}

export interface ComputedBasketLineItem {
  sku: string;
  title: string;
  slug: string;
  quantity: number;
  basePriceExVatPence: number;
  finishOption: string;
  finishName: string;
  mobilityOption: string;
  mobilityName: string;
  primaryImage?: string;
  configuredUnitExVatPence: number;
  discountPercentage: number;
  discountedUnitExVatPence: number;
  lineSubtotalExVatPence: number;
  bulkSavingsExVatPence: number;
}

export interface BasketOrderSummary {
  items: ComputedBasketLineItem[];
  totalUnits: number;
  goodsSubtotalExVatPence: number;
  totalBulkSavingsExVatPence: number;
  palletCount: number;
  deliveryZone: string;
  postcode: string;
  requiresTailLift: boolean;
  deliveryExVatPence: number;
  tailLiftSurchargePence: number;
  totalExVatPence: number;
  vatAmountPence: number;
  totalIncVatPence: number;
}
