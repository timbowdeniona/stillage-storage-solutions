export interface FaqItem {
  question: string;
  answer: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  badgeText?: string;
  imageUrl?: string;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface AlgoliaHighlightField {
  value: string;
  matchLevel?: 'none' | 'partial' | 'full';
  matchedWords?: string[];
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
  technicalDrawing?: string;
  gallery?: string[];
  editableBlueprintSvg?: string;
  backdropStyle: 'sand' | 'white';
  highlights: string[];
  seoTitle?: string;
  seoDescription?: string;
  faqItems?: string[];
  _highlightResult?: Record<string, AlgoliaHighlightField | AlgoliaHighlightField[]>;
}

export interface BlueprintDimensionLine {
  id: string;
  label: string;
  subLabel?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  extX1?: number;
  extY1?: number;
  extX2?: number;
  extY2?: number;
  textOffsetX?: number;
  textOffsetY?: number;
  color?: 'primary' | 'amber' | 'teal';
  labelSide?: 'above' | 'below';
}

export interface BlueprintCalloutLeader {
  id: string;
  title: string;
  detail?: string;
  targetX: number;
  targetY: number;
  elbowX: number;
  elbowY: number;
  boxX: number;
  boxY: number;
  boxWidth?: number;
  color?: 'primary' | 'amber' | 'teal';
}

export interface BlueprintTitleBlock {
  companyName: string;
  drawingTitle: string;
  sku: string;
  dimensionsSummary: string;
  swlSummary: string;
  certificationText: string;
}

export interface BlueprintAnnotationSpec {
  sku: string;
  productTitle: string;
  baseRenderUrl: string;
  dimensions: BlueprintDimensionLine[];
  callouts: BlueprintCalloutLeader[];
  titleBlock: BlueprintTitleBlock;
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
  bulkPrice5PlusExVatPence?: number;
  bulkPrice10PlusExVatPence?: number;
  availableFinishes?: string[];
  availableMobility?: string[];
  palletsPer4Units?: number;
}

export interface AlgoliaArticleRecord {
  objectID: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  readingTimeMinutes: number;
  publishedAt: string;
  tags: string[];
  keyTakeaways: string[];
  relatedProductSkus: string[];
  _highlightResult?: Record<string, AlgoliaHighlightField>;
}

export interface AlgoliaRuleBanner {
  bannerType:
    | 'hdg-iso-1461'
    | 'loler-bespoke-cad'
    | 'bulk-pallet-fleet'
    | 'cantilever-saw-station';
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  ctaAction?: 'open-ai-advisor';
  autoConfigFinish?: string;
  guideSlug?: string;
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
  seoTitle?: string;
  seoDescription?: string;
  faqItems?: string[];
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

export type FootprintFamilyId =
  | 'euro-uk-1210'
  | 'bulk-hopper-1111'
  | 'modular-tower-1212'
  | 'post-pallet-1111'
  | 'cantilever-bay';

export interface WorkshopModuleDef {
  id: string;
  sku: string;
  name: string;
  footprintFamily: FootprintFamilyId;
  moduleRole:
    | 'base-stand'
    | 'intermediate-tier'
    | 'top-hopper'
    | 'standard-cage'
    | 'post-pallet'
    | 'cantilever';
  lengthMm: number;
  widthMm: number;
  externalHeightMm: number;
  effectiveStackedHeightMm: number;
  unitWeightKg: number;
  swlKg: number;
  maxStackTiers: number;
  cupEngagementMm: number;
  basePriceExVatPence: number;
  primaryImage: string;
  description: string;
  highlights: string[];
  allowMobilityOptions: boolean;
  availableFinishes: ('standard-blue' | 'raw-steel' | 'galvanised' | 'custom-ral')[];
}

export interface WorkshopStackTier {
  tierId: string;
  moduleId: string;
  tierIndex: number;
  finishOption: 'standard-blue' | 'raw-steel' | 'galvanised' | 'custom-ral';
  mobilityOption:
    | 'standard-feet'
    | 'forklift-pockets'
    | 'heavy-duty-castors'
    | 'both-castors-pockets';
  customLabel?: string;
}

export interface StackEngineeringSummary {
  totalTiers: number;
  totalAssembledHeightMm: number;
  totalTareWeightKg: number;
  totalSwlCapacityKg: number;
  bottomUnitCompressionLoadKg: number;
  maxCertifiedTiers: number;
  isStackHeightCompliant: boolean;
  isClearanceCompliant: boolean;
  clearanceMarginMm: number;
  footprintConsistent: boolean;
  centerOfGravityRatio: number;
  stabilityRating: 'optimal' | 'moderate' | 'exceeds-recommended';
  safetyWarnings: string[];
  safetyCertifications: string[];
}

export interface WorkshopPreset {
  id: string;
  title: string;
  subtitle: string;
  footprintFamily: FootprintFamilyId;
  description: string;
  recommendedIndustry: string;
  defaultClearanceMm: number;
  tiers: Omit<WorkshopStackTier, 'tierId'>[];
}

