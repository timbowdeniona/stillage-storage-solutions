import { FINISH_OPTIONS, MOBILITY_OPTIONS, SEED_PRODUCTS } from '@/data/seedCatalog';
import {
  getProductRecommendations,
  parseNaturalLanguageSearchIntent,
  searchProductsWithAlgolia,
} from '@/lib/algolia';
import {
  AiSpecAdvisorRequest,
  AiSpecAdvisorResponse,
  BespokeCadBrief,
  Product,
} from '@/types/catalog';

export const AGENT_MODEL_ID = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export async function runAiSpecAdvisor(
  request: AiSpecAdvisorRequest,
  catalogProducts: Product[] = SEED_PRODUCTS
): Promise<AiSpecAdvisorResponse> {
  const prompt = (request.prompt || '').trim();
  const lower = prompt.toLowerCase();
  const parsedIntent = parseNaturalLanguageSearchIntent(prompt);

  // 1. Retrieve candidate specifications from Algolia using parsed intent
  const searchRes = await searchProductsWithAlgolia(catalogProducts, {
    query: parsedIntent.detectedCategorySlug ? '' : parsedIntent.cleanedQuery,
    categorySlug: parsedIntent.detectedCategorySlug || 'all',
    minSwlKg: request.targetSwlKg || parsedIntent.detectedMinSwlKg || 0,
    footprintMm: parsedIntent.detectedFootprintMm,
  });

  // Score all catalog products against the user's engineering description if Algolia keyword query was narrow
  const scoredPool = (searchRes.hits.length > 0 ? searchRes.hits : catalogProducts).map(
    (product) => {
      let score = product.featured ? 15 : 10;

      if (
        parsedIntent.detectedCategorySlug &&
        product.categorySlug === parsedIntent.detectedCategorySlug
      ) {
        score += 45;
      }

      if (/\b(bar|tube|pipe|extrusion|conduit|saw|6m|3m|long)\b/i.test(lower)) {
        if (product.categorySlug === 'cantilever-bar-racks') score += 50;
        if (/\b(compact|saw|1800|van|2-bay|small)\b/i.test(lower) && product.sku === 'SSS-CANT-2B4A') {
          score += 25;
        }
      }

      if (/\b(hopper|gravity|aggregate|funnel|top-feed|tower)\b/i.test(lower)) {
        if (product.sku === 'SSS-HOP-4T1000') score += 60;
      }

      if (/\b(pick|picking|visible|visibility|mesh|cage|drop\s*gate|aisle)\b/i.test(lower)) {
        if (product.sku === 'SSS-MSH-1210HD') score += 55;
      }

      if (/\b(casting|stamp|scrap|oily|sharp|sheet|solid|loose|foundry)\b/i.test(lower)) {
        if (product.sku === 'SSS-SHT-1210') score += 55;
      }

      if (/\b(return|collapsible|demountable|nest|empty|post\s*pallet|site|timber)\b/i.test(lower)) {
        if (product.sku === 'SSS-PST-1111D') score += 55;
      }

      const targetSwl = request.targetSwlKg || parsedIntent.detectedMinSwlKg || 0;
      if (targetSwl > 0 && product.swlKg >= targetSwl) {
        score += 20;
      }

      return { product, score };
    }
  );

  scoredPool.sort((a, b) => b.score - a.score);
  const selectedProduct = scoredPool[0]?.product || catalogProducts[0];

  // 2. Determine optimal Finish & Base Mobility configuration
  let finishOption = parsedIntent.suggestedFinishOption || 'standard-blue';
  if (request.environment === 'outdoor') {
    finishOption = 'galvanised';
  } else if (request.environment === 'foundry') {
    finishOption = 'raw-steel';
  }

  let mobilityOption = parsedIntent.suggestedMobilityOption || 'standard-feet';
  if (request.handling === 'telehandler') {
    mobilityOption = 'forklift-pockets';
  } else if (request.handling === 'castors') {
    mobilityOption =
      finishOption === 'galvanised' ? 'both-castors-pockets' : 'heavy-duty-castors';
  }

  // Extract explicit quantity if mentioned, or recommend 8 units (2 HGV pallets + 5% Bulk Discount)
  const qtyMatch = lower.match(/\b(\d{1,3})\s*(?:units?|stillages?|racks?|cages?|pallets?|bins?)\b/i);
  const rawRequestedQty = qtyMatch ? Math.max(1, Number(qtyMatch[1])) : 8;
  // Optimize quantity to 4-unit pallet multiple or 8 units (2 full pallets + 5% discount)
  const recommendedQuantity =
    rawRequestedQty === 3 ? 4 : rawRequestedQty === 4 ? 8 : rawRequestedQty;

  const finishObj =
    FINISH_OPTIONS.find((f) => f.id === finishOption) || FINISH_OPTIONS[0];
  const mobilityObj =
    MOBILITY_OPTIONS.find((m) => m.id === mobilityOption) || MOBILITY_OPTIONS[0];

  // 3. Retrieve Algolia Complementary Recommendations for the chosen specification
  const recResult = await getProductRecommendations(selectedProduct, catalogProducts, 3);

  const configuratorUrl = `/products/${selectedProduct.slug}?finish=${encodeURIComponent(
    finishOption
  )}&mobility=${encodeURIComponent(mobilityOption)}&qty=${recommendedQuantity}`;

  // 4. Construct Engineering Rationale, Compliance Note & Bespoke CAD Brief
  const isCraneMentioned =
    request.handling === 'crane' || /\b(crane|hoist|gantry|hiab|loler|sling|lifting\s*lug)\b/i.test(lower);

  let defaultRationale = `Selected ${selectedProduct.title} (${selectedProduct.sku}) rated to ${selectedProduct.swlKg}kg SWL (${selectedProduct.externalLengthMm}×${selectedProduct.externalWidthMm}×${selectedProduct.externalHeightMm}mm) in ${selectedProduct.steelSpecification}. `;
  if (finishOption === 'galvanised') {
    defaultRationale += `Configured with Hot-Dip Galvanised (BS EN ISO 1461) protection (+£45/unit) for 25+ year corrosion resistance in outdoor yard or wash-down service. `;
  } else if (finishOption === 'raw-steel') {
    defaultRationale += `Configured in Raw Unpainted Mill Steel (-£10/unit) to prevent paint blistering under hot foundry castings or oily press-shop components. `;
  } else {
    defaultRationale += `Finished in high-visibility RAL 5010 Stillage Blue (£0 modifier) for indoor warehouse and forklift mast contrast. `;
  }

  if (mobilityOption === 'forklift-pockets') {
    defaultRationale += `Includes Enclosed 4-Way Forklift Guide Pockets (+£30/unit) for secure rough-terrain telehandler and yard forklift lifting.`;
  } else if (mobilityOption === 'heavy-duty-castors' || mobilityOption === 'both-castors-pockets') {
    defaultRationale += `Fitted with 150mm polyurethane braked castors for point-of-use workshop mobility while preserving vertical stackability.`;
  } else {
    defaultRationale += `Equipped with self-centring pressed steel pyramid stacking feet for ${selectedProduct.stackableHeight} stability.`;
  }

  const complianceNote = isCraneMentioned
    ? 'LOLER 1998 Notice: Overhead crane or HIAB suspension requires certified top lifting lugs and 6-monthly Competent Person thorough examination. Use the Bespoke CAD Brief below for crane-rated certification.'
    : `PUWER 1998 & UKCA Certified: Rated to ${selectedProduct.swlKg}kg UDL (${selectedProduct.stackableHeight}). Inspect corner box-section stanchions and pressed pyramid feet every 6–12 months.`;

  const palletCount = Math.ceil(recommendedQuantity / 4);
  const discountLabel =
    recommendedQuantity >= 10
      ? '10% Maximum Trade Discount'
      : recommendedQuantity >= 5
      ? '5% Bulk Tier Discount'
      : 'Standard Tier (Add 1+ more unit to unlock 5% Bulk Discount at 5+ units)';

  const palletOptimizationTip = `Ordering ${recommendedQuantity} units utilizes ${palletCount} HGV pallet space${
    palletCount > 1 ? 's' : ''
  } (up to 4 stillages stack per pallet) and unlocks our ${discountLabel}.`;

  const customDimMatch = lower.match(/\b(\d{3,4})\s*[x×*]\s*(\d{3,4})(?:\s*[x×*]\s*(\d{3,4}))?\s*(?:mm)?\b/i);
  const customDimensionsMm = customDimMatch
    ? `${customDimMatch[1]} × ${customDimMatch[2]} × ${customDimMatch[3] || selectedProduct.externalHeightMm} mm`
    : `${selectedProduct.externalLengthMm} × ${selectedProduct.externalWidthMm} × ${selectedProduct.externalHeightMm} mm`;

  const targetSwlKg =
    request.targetSwlKg || parsedIntent.detectedMinSwlKg || selectedProduct.swlKg;

  const bespokeCadBrief: BespokeCadBrief = {
    referenceCode: `CAD-${selectedProduct.sku}-${targetSwlKg}`,
    suggestedDimensionsMm: customDimensionsMm,
    targetSwlKg,
    recommendedSteelGauge:
      targetSwlKg >= 1500
        ? '80×80×4mm Structural RHS Uprights + 50×50×3mm Base Frame (BS EN 10219 S275JR)'
        : '50×50×3mm Structural RHS Corner Posts + 2.5mm Reinforced Base Deck (BS EN 10219 S275JR)',
    recommendedFinish: finishObj.name,
    complianceStandard: isCraneMentioned
      ? 'LOLER 1998 Lifting Accessory + BS EN 13155 Crane Lugs + UKCA'
      : 'PUWER 1998 Work Equipment + UKCA Load Tested (Safety Factor 2.0:1)',
    engineeringSummary: `Custom fabrication brief based on ${selectedProduct.sku} architecture for: "${
      prompt || 'Heavy-duty industrial steel storage'
    }". Prepared by ${AGENT_MODEL_ID} Steel Engineering Agent.`,
  };

  let executiveSummary = `Based on your load and operating profile, our ${AGENT_MODEL_ID} engineering agent matched ${selectedProduct.sku} (${selectedProduct.title}) from the Algolia index, paired with ${finishObj.code} finish and ${mobilityObj.name}.`;
  let engine: AiSpecAdvisorResponse['engine'] = 'algolia-rag-engineering-engine';

  // 5. Optional Live Gemini 3.8 Flash LLM Call when GEMINI_API_KEY is available
  const geminiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey && prompt.length > 0) {
    try {
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${AGENT_MODEL_ID}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are the Senior Steel Stillage Engineer at Stillage Storage Solutions UK.
User requirement: "${prompt}"
Selected Algolia Product: ${selectedProduct.title} (SKU: ${selectedProduct.sku}, ${selectedProduct.swlKg}kg SWL, ${selectedProduct.externalLengthMm}x${selectedProduct.externalWidthMm}x${selectedProduct.externalHeightMm}mm, ${selectedProduct.steelSpecification}).
Recommended Finish: ${finishObj.name}
Recommended Base/Mobility: ${mobilityObj.name}
Write a concise 2-sentence executive engineering summary explaining why this exact stillage, finish, and base configuration is optimal for their workflow and UK safety compliance.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (apiRes.ok) {
        const data = await apiRes.json();
        const generatedText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (generatedText) {
          executiveSummary = generatedText;
          engine = 'gemini-3.8-flash-algolia-rag';
        }
      }
    } catch {
      // Deterministic Algolia RAG summary already prepared above
    }
  }

  return {
    model: AGENT_MODEL_ID,
    engine,
    executiveSummary,
    primaryRecommendation: {
      product: selectedProduct,
      finishOption,
      finishName: finishObj.name,
      mobilityOption,
      mobilityName: mobilityObj.name,
      recommendedQuantity,
      rationale: defaultRationale,
      complianceNote,
      configuratorUrl,
    },
    complementaryFleet: recResult.compatibleEquipment,
    palletOptimizationTip,
    bespokeCadBrief,
  };
}
