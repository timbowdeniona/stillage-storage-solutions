'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  FileCode2,
  CheckCircle2,
  Loader2,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AiSpecAdvisorRequest, AiSpecAdvisorResponse } from '@/types/catalog';
import { useVat } from '@/context/VatContext';

const PRESET_SCENARIOS = [
  {
    label: '6m Steel Bar & Tube by Band Saw',
    prompt: 'We need to store 1200kg of 6m steel box section and tube next to a CNC band saw, moved by forklift',
    environment: 'indoor' as const,
    handling: 'forklift' as const,
  },
  {
    label: 'Outdoor Yard Stampings (Telehandler)',
    prompt: 'Outdoor rust-proof bin stillage for 1000kg heavy metal components moved by rough-terrain telehandler',
    environment: 'outdoor' as const,
    handling: 'telehandler' as const,
  },
  {
    label: 'Stacked Warehouse Aisle Order Picking',
    prompt: '1200x1000 mesh cages stacked 4-high where pickers need drop-gate front access and mobile castors',
    environment: 'indoor' as const,
    handling: 'castors' as const,
  },
  {
    label: 'Returnable HGV Fleet Post Pallets',
    prompt: 'Collapsible demountable post pallets for timber and extrusions to cut empty return HGV trailer space',
    environment: 'outdoor' as const,
    handling: 'forklift' as const,
  },
];

interface AiSpecAdvisorProps {
  externalOpenSignal?: number;
  initialPrompt?: string;
}

export function AiSpecAdvisor({ externalOpenSignal = 0, initialPrompt }: AiSpecAdvisorProps = {}) {
  const { formatBothPrices } = useVat();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [environment, setEnvironment] = useState<AiSpecAdvisorRequest['environment']>('indoor');
  const [handling, setHandling] = useState<AiSpecAdvisorRequest['handling']>('forklift');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiSpecAdvisorResponse | null>(null);
  const [showCadBrief, setShowCadBrief] = useState(false);

  useEffect(() => {
    if (externalOpenSignal > 0) {
      setIsOpen(true);
      setShowCadBrief(true);
      if (initialPrompt) {
        setPrompt(initialPrompt);
      }
    }
  }, [externalOpenSignal, initialPrompt]);

  const submitAdvisorQuery = async (override?: Partial<AiSpecAdvisorRequest>) => {
    const activePrompt = override?.prompt !== undefined ? override.prompt : prompt;
    const activeEnv = override?.environment || environment;
    const activeHandling = override?.handling || handling;

    setLoading(true);
    setIsOpen(true);

    try {
      const res = await fetch('/api/ai/spec-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt || 'Recommend a heavy-duty 1000kg stackable warehouse stillage',
          environment: activeEnv,
          handling: activeHandling,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as AiSpecAdvisorResponse;
        setResponse(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAdvisorQuery();
  };

  // Modern Web Guidance (ime-safe-enter-submit): prevent premature Enter submission during IME composition
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.nativeEvent.isComposing || e.keyCode === 229) {
        return;
      }
      submitAdvisorQuery();
    }
  };

  return (
    <section
      aria-labelledby="ai-spec-advisor-heading"
      className="mb-8 border-2 border-brand-navy bg-surface-white shadow-sm overflow-hidden"
    >
      {/* Top Banner */}
      <div className="bg-brand-navy text-surface-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-stillage-blue text-surface-sand">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="ai-spec-advisor-heading"
                className="font-display font-bold uppercase tracking-wider text-base text-surface-white"
              >
                AI Steel Stillage Engineer &amp; Load Advisor
              </h2>
              <span className="font-mono text-[10px] bg-stillage-blue/40 border border-stillage-blueLight text-surface-sand px-2 py-0.5 rounded-sm">
                gemini-3.8-flash + Algolia RAG
              </span>
            </div>
            <p className="text-xs text-steel-200">
              Describe what you are storing, load weight, and handling method — our AI engineer recommends the exact stillage, finish, and pallet configuration.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="ai-advisor-panel"
          className="font-mono text-xs bg-surface-sand text-brand-navy hover:bg-white px-3.5 py-1.5 rounded-sm font-bold inline-flex items-center gap-1.5 transition-colors"
        >
          <span>{isOpen ? 'Hide AI Engineer' : 'Ask AI Steel Engineer'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Scenario Pills (Always visible for 1-click exploration) */}
      <div className="bg-surface-sandLight px-5 py-3 border-b border-steel-200 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase font-bold text-brand-navy mr-1">
          Try Engineering Scenario:
        </span>
        {PRESET_SCENARIOS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setPrompt(preset.prompt);
              setEnvironment(preset.environment);
              setHandling(preset.handling);
              submitAdvisorQuery({
                prompt: preset.prompt,
                environment: preset.environment,
                handling: preset.handling,
              });
            }}
            className="text-xs font-mono bg-white hover:bg-brand-navy hover:text-surface-sand text-steel-800 border border-steel-200 px-3 py-1 rounded-sm transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {isOpen && (
        <div id="ai-advisor-panel" className="p-5 space-y-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ai-advisor-prompt"
                className="block font-display font-bold uppercase tracking-wider text-xs text-brand-navy mb-1.5"
              >
                Describe Your Material, Dimensions, Weight &amp; Site Workflow
              </label>
              <textarea
                id="ai-advisor-prompt"
                name="prompt"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="e.g. Storing 900kg of oily automotive stampings in an outdoor yard, moved by rough-terrain telehandler..."
                className="w-full p-3 border border-steel-200 rounded-sm text-sm text-steel-900 focus:outline-none focus:border-stillage-blue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Operating Environment Radio Group (<6 options per Modern Web Guidance forms) */}
              <fieldset className="md:col-span-5">
                <legend className="font-mono text-[11px] uppercase font-bold text-steel-600 mb-1.5">
                  Operating Environment
                </legend>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  {[
                    { id: 'indoor', label: 'Indoor Dry' },
                    { id: 'outdoor', label: 'Outdoor Yard' },
                    { id: 'foundry', label: 'Foundry / Oily' },
                  ].map((env) => (
                    <label
                      key={env.id}
                      className={`cursor-pointer border px-2.5 py-2 rounded-sm text-center transition-colors ${
                        environment === env.id
                          ? 'bg-brand-navy text-surface-sand border-brand-navy font-bold'
                          : 'bg-surface-sandLight text-steel-800 border-steel-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="environment"
                        value={env.id}
                        checked={environment === env.id}
                        onChange={() =>
                          setEnvironment(env.id as AiSpecAdvisorRequest['environment'])
                        }
                        className="sr-only"
                      />
                      {env.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Site Handling Method Radio Group */}
              <fieldset className="md:col-span-5">
                <legend className="font-mono text-[11px] uppercase font-bold text-steel-600 mb-1.5">
                  Site Handling Equipment
                </legend>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                  {[
                    { id: 'forklift', label: 'Forklift' },
                    { id: 'telehandler', label: 'Telehandler' },
                    { id: 'castors', label: 'Castors' },
                    { id: 'crane', label: 'Crane/HIAB' },
                  ].map((h) => (
                    <label
                      key={h.id}
                      className={`cursor-pointer border px-2 py-2 rounded-sm text-center transition-colors ${
                        handling === h.id
                          ? 'bg-stillage-blue text-white border-stillage-blue font-bold'
                          : 'bg-surface-sandLight text-steel-800 border-steel-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="handling"
                        value={h.id}
                        checked={handling === h.id}
                        onChange={() => setHandling(h.id as AiSpecAdvisorRequest['handling'])}
                        className="sr-only"
                      />
                      {h.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs py-2.5 px-4 rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Recommend</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* AI Recommendation Output */}
          {response && (
            <div className="border-t border-steel-200 pt-5 space-y-5">
              {/* Executive Summary */}
              <div className="bg-surface-sand/60 border-l-4 border-stillage-blue p-4 rounded-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-brand-navy font-bold mb-1">
                  <span>AI ENGINEERING RECOMMENDATION ({response.model})</span>
                  <span className="bg-brand-navy text-surface-sand px-2 py-0.5 rounded-sm">
                    SKU: {response.primaryRecommendation.product.sku}
                  </span>
                </div>
                <p className="text-sm text-steel-900 leading-relaxed">
                  {response.executiveSummary}
                </p>
              </div>

              {/* Primary Recommended Spec Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface-white border border-steel-200 p-5">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="bg-emerald-700 text-white px-2.5 py-0.5 rounded-sm font-bold">
                      PRIMARY MATCH
                    </span>
                    <span className="font-bold text-brand-navy">
                      {response.primaryRecommendation.product.swlKg}kg SWL
                    </span>
                    <span className="text-steel-400">•</span>
                    <span className="text-steel-600">
                      {response.primaryRecommendation.product.externalLengthMm}×
                      {response.primaryRecommendation.product.externalWidthMm}×
                      {response.primaryRecommendation.product.externalHeightMm}mm
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl uppercase text-brand-navy">
                    {response.primaryRecommendation.product.title}
                  </h3>

                  <p className="text-xs text-steel-800 leading-relaxed">
                    {response.primaryRecommendation.rationale}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs">
                    <div className="bg-surface-sandLight p-2.5 border border-steel-200">
                      <div className="text-[10px] text-steel-600 uppercase">Recommended Finish</div>
                      <div className="font-bold text-brand-navy mt-0.5">
                        {response.primaryRecommendation.finishName}
                      </div>
                    </div>
                    <div className="bg-surface-sandLight p-2.5 border border-steel-200">
                      <div className="text-[10px] text-steel-600 uppercase">Base &amp; Handling</div>
                      <div className="font-bold text-brand-navy mt-0.5">
                        {response.primaryRecommendation.mobilityName}
                      </div>
                    </div>
                    <div className="bg-surface-sandLight p-2.5 border border-steel-200">
                      <div className="text-[10px] text-steel-600 uppercase">Optimal Fleet Batch</div>
                      <div className="font-bold text-stillage-blue mt-0.5">
                        {response.primaryRecommendation.recommendedQuantity} Units (5% Off Tier)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-steel-800 bg-emerald-50 border border-emerald-600/40 p-3 rounded-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{response.primaryRecommendation.complianceNote}</span>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="lg:col-span-4 bg-surface-sandLight border border-steel-200 p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="font-mono text-[11px] uppercase text-steel-600">
                      Base Unit Price
                    </div>
                    <div className="font-mono font-bold text-2xl text-brand-navy mt-0.5">
                      {
                        formatBothPrices(
                          response.primaryRecommendation.product.basePriceExVatPence
                        ).primary
                      }
                    </div>
                    <div className="font-mono text-[11px] text-steel-600">
                      {
                        formatBothPrices(
                          response.primaryRecommendation.product.basePriceExVatPence
                        ).secondary
                      }
                    </div>

                    <div className="mt-3 pt-3 border-t border-steel-200 flex items-start gap-2 text-xs text-steel-800">
                      <Truck className="w-4 h-4 text-stillage-blue shrink-0 mt-0.5" />
                      <span>{response.palletOptimizationTip}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={response.primaryRecommendation.configuratorUrl}
                      className="w-full bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <span>Open With Options Pre-Selected</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowCadBrief(!showCadBrief)}
                      className="w-full bg-brand-navy hover:bg-brand-navyLight text-surface-sand font-mono text-[11px] font-bold py-2 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-accent-amber" />
                      <span>
                        {showCadBrief
                          ? 'Hide Bespoke CAD Fabrication Brief'
                          : 'Generate Bespoke CAD Spec Brief'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable AI Bespoke CAD Fabrication Brief */}
              {showCadBrief && (
                <div className="bg-brand-navy text-surface-white p-5 border-l-4 border-accent-amber space-y-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2">
                    <span className="text-surface-sand font-bold flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-accent-amber" />
                      AI BESPOKE CAD FABRICATION BRIEF • REF: {response.bespokeCadBrief.referenceCode}
                    </span>
                    <span className="text-steel-200">Wrexham &amp; Midlands Steel Works</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <div className="text-steel-400 text-[10px] uppercase">Target Footprint</div>
                      <div className="text-surface-sand font-bold">
                        {response.bespokeCadBrief.suggestedDimensionsMm}
                      </div>
                    </div>
                    <div>
                      <div className="text-steel-400 text-[10px] uppercase">Rated SWL</div>
                      <div className="text-surface-sand font-bold">
                        {response.bespokeCadBrief.targetSwlKg} kg UDL
                      </div>
                    </div>
                    <div>
                      <div className="text-steel-400 text-[10px] uppercase">Steel Section Spec</div>
                      <div className="text-white">
                        {response.bespokeCadBrief.recommendedSteelGauge}
                      </div>
                    </div>
                    <div>
                      <div className="text-steel-400 text-[10px] uppercase">Compliance Standard</div>
                      <div className="text-accent-teal font-bold">
                        {response.bespokeCadBrief.complianceStandard}
                      </div>
                    </div>
                  </div>
                  <p className="text-steel-200 leading-relaxed pt-1">
                    {response.bespokeCadBrief.engineeringSummary}
                  </p>
                  <div className="pt-2">
                    <a
                      href={`mailto:sales@stillagestoragesolutions.co.uk?subject=${encodeURIComponent(
                        `Bespoke CAD Quote Request: ${response.bespokeCadBrief.referenceCode}`
                      )}&body=${encodeURIComponent(
                        `Reference: ${response.bespokeCadBrief.referenceCode}\nTarget Dimensions: ${response.bespokeCadBrief.suggestedDimensionsMm}\nTarget SWL: ${response.bespokeCadBrief.targetSwlKg}kg\nSteel Gauge: ${response.bespokeCadBrief.recommendedSteelGauge}\nFinish: ${response.bespokeCadBrief.recommendedFinish}\nCompliance: ${response.bespokeCadBrief.complianceStandard}\n\nNotes: ${response.bespokeCadBrief.engineeringSummary}`
                      )}`}
                      className="inline-flex items-center gap-2 bg-surface-sand text-brand-navy font-display font-bold uppercase px-4 py-2 rounded-sm text-xs hover:bg-white transition-colors"
                    >
                      <span>Send Brief to CAD Engineering Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Algolia Complementary Fleet Strip */}
              {response.complementaryFleet.length > 0 && (
                <div className="pt-2">
                  <div className="font-mono text-xs uppercase text-brand-navy font-bold mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-stillage-blue" />
                    <span>Compatible Algolia Fleet Pairings</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {response.complementaryFleet.map((comp) => (
                      <Link
                        key={comp.product.id}
                        href={`/products/${comp.product.slug}`}
                        className="p-3 border border-steel-200 hover:border-stillage-blue bg-surface-sandLight/50 rounded-sm flex flex-col justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="font-bold text-brand-navy">{comp.product.sku}</span>
                            <span className="text-stillage-blue font-bold">
                              {comp.product.swlKg}kg SWL
                            </span>
                          </div>
                          <div className="font-display font-bold uppercase text-sm text-brand-navy mt-1">
                            {comp.product.title}
                          </div>
                          <div className="text-[11px] text-steel-600 mt-1">{comp.matchReason}</div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-steel-200 font-mono text-[11px] text-stillage-blue font-bold flex items-center justify-between">
                          <span>View Spec</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
