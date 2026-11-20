'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  MapPin,
  Monitor,
  PoundSterling,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Terminal,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import type {
  AdminAnalyticsSummary,
  AnalyticsDataSources,
  AnalyticsRange,
  AnalyticsTrendPoint,
} from '@/lib/adminAnalytics';

export interface AdminAnalyticsDashboardProps {
  initialData: AdminAnalyticsSummary;
  adminEmail: string;
  adminName: string;
}

const RANGE_OPTIONS: ReadonlyArray<{
  value: AnalyticsRange;
  label: string;
  description: string;
}> = [
  { value: '7d', label: '7D', description: 'Last 7 days' },
  { value: '30d', label: '30D', description: 'Last 30 days' },
  { value: '90d', label: '90D', description: 'Last 90 days' },
  { value: 'all', label: 'All', description: 'All time' },
];

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const GBP_WHOLE_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const UK_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const UK_TIMESTAMP_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

function formatGbp(pence: number): string {
  return GBP_FORMATTER.format((Number.isFinite(pence) ? pence : 0) / 100);
}

function formatAxisGbp(pence: number): string {
  return GBP_WHOLE_FORMATTER.format((Number.isFinite(pence) ? pence : 0) / 100);
}

function formatUkDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return UK_DATE_FORMATTER.format(parsed);
}

function formatUtcTimestamp(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return `${UK_TIMESTAMP_FORMATTER.format(parsed)} UTC`;
}

function formatDurationSeconds(seconds?: number | null): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) {
    return '0s';
  }
  const rounded = Math.round(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function computeNiceMaxPence(maxPence: number): number {
  if (!Number.isFinite(maxPence) || maxPence <= 0) {
    return 100_000; // £1,000 default ceiling when there is no revenue yet
  }
  const maxPounds = maxPence / 100;
  const rawStep = maxPounds / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;

  let niceStepFactor = 10;
  for (const candidate of [1, 2, 2.5, 5, 10]) {
    if (normalized <= candidate) {
      niceStepFactor = candidate;
      break;
    }
  }

  const niceCeilingPounds = Math.max(4, Math.ceil(niceStepFactor * magnitude * 4));
  return niceCeilingPounds * 100;
}

function computeNiceMaxCount(maxCount: number): number {
  if (!Number.isFinite(maxCount) || maxCount <= 0) {
    return 20;
  }
  const rawStep = maxCount / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;

  let niceStepFactor = 10;
  for (const candidate of [1, 2, 2.5, 5, 10]) {
    if (normalized <= candidate) {
      niceStepFactor = candidate;
      break;
    }
  }

  return Math.max(4, Math.ceil(niceStepFactor * magnitude * 4));
}

function getSourceBadges(sources?: AnalyticsDataSources): {
  stripeLabel: string;
  stripeClassName: string;
  gaLabel: string;
  gaClassName: string;
} {
  const stripeStatus = sources?.stripe.status;
  const stripeUsingFallback = sources?.stripe.usingFallback ?? true;

  let stripeLabel = 'Stripe: Local Fallback';
  let stripeClassName = 'bg-steel-100 text-steel-700 border-steel-200';
  if (!stripeUsingFallback && stripeStatus === 'live') {
    stripeLabel = 'Stripe: Live';
    stripeClassName = 'bg-accent-teal/10 text-accent-teal border-accent-teal/25';
  } else if (!stripeUsingFallback && stripeStatus === 'test') {
    stripeLabel = 'Stripe: Test Mode';
    stripeClassName = 'bg-stillage-blue/10 text-stillage-blue border-stillage-blue/25';
  } else if (stripeStatus === 'error') {
    stripeLabel = 'Stripe: Offline Fallback';
    stripeClassName = 'bg-accent-amber/10 text-accent-amber border-accent-amber/25';
  }

  const gaStatus = sources?.googleAnalytics.status;
  const gaUsingFallback = sources?.googleAnalytics.usingFallback ?? true;

  let gaLabel = 'GA4: Setup Needed';
  let gaClassName = 'bg-steel-100 text-steel-700 border-steel-200';
  if (!gaUsingFallback && gaStatus === 'live') {
    gaLabel = sources?.googleAnalytics.propertyIdMasked
      ? `GA4: Live (${sources.googleAnalytics.propertyIdMasked})`
      : 'GA4: Live';
    gaClassName = 'bg-accent-teal/10 text-accent-teal border-accent-teal/25';
  } else if (gaStatus === 'error') {
    gaLabel = 'GA4: Offline Fallback';
    gaClassName = 'bg-accent-amber/10 text-accent-amber border-accent-amber/25';
  }

  return { stripeLabel, stripeClassName, gaLabel, gaClassName };
}

function formatPaymentMode(paymentMode: string): {
  label: string;
  className: string;
} {
  const mode = paymentMode.trim().toLowerCase();
  if (mode === 'b2b_proforma' || mode === 'proforma' || mode === 'proforma_invoice') {
    return {
      label: 'Proforma',
      className: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20',
    };
  }
  if (mode === 'card' || mode === 'stripe_card') {
    return {
      label: 'Card',
      className: 'bg-stillage-blue/10 text-stillage-blue border-stillage-blue/20',
    };
  }
  return {
    label: paymentMode || 'Trade',
    className: 'bg-steel-100 text-steel-800 border-steel-200',
  };
}

function getOrderStatusBadge(status: string): {
  label: string;
  className: string;
} {
  const normalized = status.trim().toLowerCase();
  if (
    normalized === 'paid' ||
    normalized === 'dispatched' ||
    normalized === 'delivered' ||
    normalized === 'completed'
  ) {
    return {
      label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
      className: 'bg-accent-teal/10 text-accent-teal border-accent-teal/25',
    };
  }
  if (normalized === 'invoiced') {
    return {
      label: 'Invoiced',
      className: 'bg-stillage-blue/10 text-stillage-blue border-stillage-blue/25',
    };
  }
  if (normalized === 'pending') {
    return {
      label: 'Pending',
      className: 'bg-accent-amber/10 text-accent-amber border-accent-amber/25',
    };
  }
  return {
    label: normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Recorded',
    className: 'bg-steel-100 text-steel-600 border-steel-200',
  };
}

function renderDeltaPill(changePct: number | null, range: AnalyticsRange) {
  if (changePct === null) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-steel-100 text-steel-600 border border-steel-200">
        {range === 'all' ? 'All time' : 'Baseline'}
      </span>
    );
  }

  const isPositive = changePct >= 0;
  const formatted = `${isPositive ? '+' : ''}${changePct.toFixed(1)}%`;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
        isPositive
          ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/25'
          : 'bg-accent-amber/10 text-accent-amber border-accent-amber/25'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span>{formatted}</span>
    </span>
  );
}

interface TrendChartProps {
  trendSeries: AnalyticsTrendPoint[];
  range: AnalyticsRange;
  gaLive: boolean;
}

function RevenueTrendChart({ trendSeries, range, gaLive }: TrendChartProps) {
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [metricMode, setMetricMode] = useState<'revenue' | 'visitors'>('revenue');

  useEffect(() => {
    setActiveBarIndex(null);
  }, [trendSeries, range, metricMode]);

  const isRevenueMode = metricMode === 'revenue';
  const isWeekly = range === '90d' || range === 'all';
  const defaultFocusIndex = (() => {
    for (let i = trendSeries.length - 1; i >= 0; i -= 1) {
      const point = trendSeries[i];
      if (
        isRevenueMode
          ? point.ordersCount > 0 || point.revenueExVatPence > 0
          : (point.visitors ?? 0) > 0
      ) {
        return i;
      }
    }
    return trendSeries.length > 0 ? trendSeries.length - 1 : -1;
  })();

  const inspectedIndex =
    activeBarIndex !== null && activeBarIndex >= 0 && activeBarIndex < trendSeries.length
      ? activeBarIndex
      : defaultFocusIndex;
  const inspectedPoint = inspectedIndex >= 0 ? trendSeries[inspectedIndex] : null;

  const svgWidth = 840;
  const svgHeight = 280;
  const margin = { top: 34, right: 20, bottom: 38, left: 74 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const maxValue = trendSeries.reduce(
    (max, point) =>
      Math.max(max, isRevenueMode ? point.revenueExVatPence : point.visitors ?? 0),
    0
  );
  const niceMaxValue = isRevenueMode
    ? computeNiceMaxPence(maxValue)
    : computeNiceMaxCount(maxValue);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const count = trendSeries.length;
  const slotWidth = count > 0 ? plotWidth / count : plotWidth;
  const barWidth = Math.max(4, Math.min(36, slotWidth * 0.62));
  const labelStep = count <= 8 ? 1 : Math.ceil(count / 7);

  const chartAriaLabel = isRevenueMode
    ? `${isWeekly ? 'Weekly' : 'Daily'} Stripe revenue and order trend chart covering ${count} ${isWeekly ? 'weeks' : 'days'}, peak ${formatAxisGbp(maxValue)} Ex. VAT.`
    : `${isWeekly ? 'Weekly' : 'Daily'} website visitor trend chart covering ${count} ${isWeekly ? 'weeks' : 'days'}, peak ${maxValue.toLocaleString('en-GB')} visitors.`;

  return (
    <section
      aria-labelledby="trend-chart-heading"
      className="bg-surface-white border border-steel-200 rounded-lg p-6 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id="trend-chart-heading"
              className="font-display font-bold text-xl text-brand-navy flex items-center gap-2"
            >
              <BarChart3
                className={`w-5 h-5 ${isRevenueMode ? 'text-stillage-blue' : 'text-accent-teal'}`}
                aria-hidden="true"
              />
              <span>
                {isRevenueMode ? 'Stripe Revenue & Orders Trend' : 'Website Visitors Trend'}
              </span>
            </h2>

            <div
              role="group"
              aria-label="Chart metric"
              className="inline-flex items-center rounded-md bg-steel-100 p-0.5 border border-steel-200"
            >
              <button
                type="button"
                aria-pressed={isRevenueMode}
                onClick={() => setMetricMode('revenue')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  isRevenueMode
                    ? 'bg-surface-white text-brand-navy shadow-sm'
                    : 'text-steel-600 hover:text-brand-navy'
                }`}
              >
                Stripe Revenue (£)
              </button>
              <button
                type="button"
                aria-pressed={!isRevenueMode}
                onClick={() => setMetricMode('visitors')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  !isRevenueMode
                    ? 'bg-surface-white text-brand-navy shadow-sm'
                    : 'text-steel-600 hover:text-brand-navy'
                }`}
              >
                GA4 Visitors
              </button>
            </div>
          </div>

          <p className="text-xs text-steel-600 mt-1">
            {isRevenueMode
              ? `${isWeekly ? 'Weekly' : 'Daily'} Stripe order revenue (Ex. VAT) — hover or focus any bar for exact figures`
              : `${isWeekly ? 'Weekly' : 'Daily'} Google Analytics 4 visitors${gaLive ? '' : ' (connect GA4 credentials for live daily traffic)'}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {inspectedPoint ? (
            <div
              aria-live="polite"
              className="inline-flex flex-wrap items-center gap-2.5 px-3.5 py-2 rounded-md bg-steel-50 border border-steel-200 text-xs font-mono"
            >
              <span className="text-steel-600 uppercase font-semibold">
                {activeBarIndex !== null ? 'Selected:' : 'Latest active:'}
              </span>
              <span className="font-bold text-brand-navy">{inspectedPoint.dateLabel}</span>
              <span className="text-steel-400" aria-hidden="true">
                ·
              </span>
              <span className="font-bold text-stillage-blue">
                {formatGbp(inspectedPoint.revenueExVatPence)} Ex. VAT
              </span>
              <span className="text-steel-400" aria-hidden="true">
                ·
              </span>
              <span className="text-steel-800 font-semibold">
                {inspectedPoint.ordersCount}{' '}
                {inspectedPoint.ordersCount === 1 ? 'order' : 'orders'}
              </span>
              {typeof inspectedPoint.visitors === 'number' ? (
                <>
                  <span className="text-steel-400" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-bold text-accent-teal">
                    {inspectedPoint.visitors.toLocaleString('en-GB')}{' '}
                    {inspectedPoint.visitors === 1 ? 'visitor' : 'visitors'}
                  </span>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="inline-flex items-center gap-2 text-xs text-steel-600 font-medium">
            <span
              className={`w-3 h-3 rounded-sm inline-block ${
                isRevenueMode ? 'bg-stillage-blue' : 'bg-accent-teal'
              }`}
              aria-hidden="true"
            />
            <span>{isRevenueMode ? 'Revenue (£ Ex. VAT)' : 'Visitors (GA4)'}</span>
          </div>
        </div>
      </div>

      {count === 0 ? (
        <div className="h-56 flex items-center justify-center rounded-md bg-steel-50 border border-steel-200 text-sm text-steel-600">
          No trend data recorded for this period yet.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            role="img"
            aria-label={chartAriaLabel}
            className="w-full min-w-[540px] h-auto select-none"
            onMouseLeave={() => setActiveBarIndex(null)}
          >
            <title>{chartAriaLabel}</title>

            {/* Horizontal gridlines & Y-axis ticks */}
            {yTicks.map((ratio) => {
              const y = margin.top + plotHeight * (1 - ratio);
              const tickVal = Math.round(niceMaxValue * ratio);
              const isBaseline = ratio === 0;
              return (
                <g key={ratio}>
                  <line
                    x1={margin.left}
                    x2={margin.left + plotWidth}
                    y1={y}
                    y2={y}
                    stroke="#DCE1E7"
                    strokeWidth={1}
                    strokeDasharray={isBaseline ? undefined : '4 4'}
                  />
                  <text
                    x={margin.left - 10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="#4A525D"
                    fontSize={11}
                    fontFamily="var(--font-mono), monospace"
                  >
                    {isRevenueMode
                      ? formatAxisGbp(tickVal)
                      : tickVal.toLocaleString('en-GB')}
                  </text>
                </g>
              );
            })}

            {/* Bars & interactive full-height slots */}
            {trendSeries.map((point, idx) => {
              const slotX = margin.left + idx * slotWidth;
              const barX = slotX + (slotWidth - barWidth) / 2;
              const pointVal = isRevenueMode
                ? point.revenueExVatPence
                : point.visitors ?? 0;
              const rawHeight =
                pointVal > 0
                  ? (pointVal / niceMaxValue) * plotHeight
                  : isRevenueMode && point.ordersCount > 0
                    ? 4
                    : 0;
              const barHeight = pointVal > 0 ? Math.max(4, rawHeight) : rawHeight;
              const barY = margin.top + plotHeight - barHeight;
              const isHighlighted = activeBarIndex === idx;

              const showXLabel =
                idx === 0 ||
                idx === count - 1 ||
                (idx % labelStep === 0 && count - 1 - idx >= Math.ceil(labelStep * 0.5));

              const defaultBarFill = isRevenueMode ? '#145DA0' : '#00897B';
              const activeBarFill = '#0F2342';

              const barAriaLabel = isRevenueMode
                ? `${point.dateLabel}: ${formatGbp(point.revenueExVatPence)} Ex. VAT, ${point.ordersCount} ${point.ordersCount === 1 ? 'order' : 'orders'}`
                : `${point.dateLabel}: ${(point.visitors ?? 0).toLocaleString('en-GB')} visitors, ${(point.pageViews ?? 0).toLocaleString('en-GB')} page views`;

              return (
                <g
                  key={point.isoDate}
                  tabIndex={0}
                  role="button"
                  aria-label={barAriaLabel}
                  className="cursor-pointer focus:outline-none"
                  onMouseEnter={() => setActiveBarIndex(idx)}
                  onFocus={() => setActiveBarIndex(idx)}
                  onBlur={() =>
                    setActiveBarIndex((current) => (current === idx ? null : current))
                  }
                  onClick={() => setActiveBarIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveBarIndex(idx);
                    }
                  }}
                >
                  {/* Slot hover/focus highlight */}
                  <rect
                    x={slotX}
                    y={margin.top}
                    width={slotWidth}
                    height={plotHeight}
                    rx={3}
                    fill={isHighlighted ? '#F1F4F7' : 'transparent'}
                  />

                  {/* Subtle baseline marker on empty days */}
                  {barHeight === 0 ? (
                    <rect
                      x={barX}
                      y={margin.top + plotHeight - 2}
                      width={barWidth}
                      height={2}
                      rx={1}
                      fill={isHighlighted ? defaultBarFill : '#DCE1E7'}
                    />
                  ) : (
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx={3}
                      fill={isHighlighted ? activeBarFill : defaultBarFill}
                    />
                  )}

                  {/* X-axis tick label */}
                  {showXLabel ? (
                    <text
                      x={slotX + slotWidth / 2}
                      y={margin.top + plotHeight + 20}
                      textAnchor={
                        idx === 0 ? 'start' : idx === count - 1 ? 'end' : 'middle'
                      }
                      fill={isHighlighted ? '#0F2342' : '#4A525D'}
                      fontWeight={isHighlighted ? 700 : 500}
                      fontSize={11}
                      fontFamily="var(--font-mono), monospace"
                    >
                      {point.dateLabel}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {/* Inline SVG tooltip pill for active hovered/focused bar */}
            {activeBarIndex !== null && trendSeries[activeBarIndex] ? (() => {
              const point = trendSeries[activeBarIndex];
              const pointVal = isRevenueMode
                ? point.revenueExVatPence
                : point.visitors ?? 0;
              const barCenterX = margin.left + activeBarIndex * slotWidth + slotWidth / 2;
              const barTopY =
                pointVal > 0
                  ? margin.top +
                    plotHeight -
                    Math.max(4, (pointVal / niceMaxValue) * plotHeight)
                  : margin.top + plotHeight - 6;

              const labelText = isRevenueMode
                ? `${point.dateLabel} · ${formatGbp(point.revenueExVatPence)} · ${point.ordersCount} ${point.ordersCount === 1 ? 'order' : 'orders'}`
                : `${point.dateLabel} · ${(point.visitors ?? 0).toLocaleString('en-GB')} visitors · ${(point.pageViews ?? 0).toLocaleString('en-GB')} views`;
              const boxWidth = Math.min(300, Math.max(170, labelText.length * 6.8 + 20));
              const boxHeight = 24;
              const clampedX = Math.max(
                margin.left,
                Math.min(margin.left + plotWidth - boxWidth, barCenterX - boxWidth / 2)
              );
              const boxY = Math.max(4, barTopY - boxHeight - 8);

              return (
                <g pointerEvents="none">
                  <rect
                    x={clampedX}
                    y={boxY}
                    width={boxWidth}
                    height={boxHeight}
                    rx={5}
                    fill="#0F2342"
                  />
                  <text
                    x={clampedX + boxWidth / 2}
                    y={boxY + boxHeight / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#FFFFFF"
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="var(--font-mono), monospace"
                  >
                    {labelText}
                  </text>
                </g>
              );
            })() : null}
          </svg>
        </div>
      )}
    </section>
  );
}

export function AdminAnalyticsDashboard({
  initialData,
  adminEmail,
  adminName,
}: AdminAnalyticsDashboardProps) {
  const [data, setData] = useState<AdminAnalyticsSummary>(initialData);
  const [activeRange, setActiveRange] = useState<AnalyticsRange>(initialData.range);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleRangeChange = async (nextRange: AnalyticsRange, bypassCache = false) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setActiveRange(nextRange);
    setIsLoading(true);
    setError(null);
    setAuthExpired(false);

    try {
      const url = bypassCache
        ? `/api/admin/analytics?range=${nextRange}&refresh=1`
        : `/api/admin/analytics?range=${nextRange}`;
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });

      if (response.status === 401) {
        setAuthExpired(true);
        setError('Your administrator session has expired. Please sign in again.');
        setActiveRange(data.range);
        return;
      }

      if (!response.ok) {
        let message = 'Unable to refresh analytics for the selected period.';
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) {
            message = payload.error;
          }
        } catch {
          // Use fallback message
        }
        setError(message);
        setActiveRange(data.range);
        return;
      }

      const nextSummary = (await response.json()) as AdminAnalyticsSummary;
      setData(nextSummary);
      setActiveRange(nextSummary.range);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError('Network error while loading analytics. Showing previously loaded figures.');
      setActiveRange(data.range);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const { kpis, topProducts, funnel, recentOrders } = data;
  const sourceBadges = getSourceBadges(data.sources);
  const stripeLive = Boolean(data.sources && !data.sources.stripe.usingFallback);
  const gaLive = Boolean(data.sources && !data.sources.googleAnalytics.usingFallback);
  const topChannels = Array.isArray(data.topChannels) ? data.topChannels : [];
  const topPages = Array.isArray(data.topPages) ? data.topPages : [];
  const topRegions = Array.isArray(data.topRegions) ? data.topRegions : [];
  const deviceBreakdown = Array.isArray(data.deviceBreakdown) ? data.deviceBreakdown : [];
  const gaMeasurementConfigured = Boolean(
    data.sources?.googleAnalytics.measurementIdConfigured
  );
  const maxDemandScore = topProducts.reduce(
    (max, item) => Math.max(max, item.ordersUnits + item.quotes + item.views),
    1
  );
  const lastUpdatedText = formatUtcTimestamp(data.generatedAt);

  return (
    <div className="bg-steel-50 min-h-screen text-steel-900">
      {/* Header Banner */}
      <header className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-mono text-steel-200"
            >
              <Link href="/" className="hover:text-surface-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-steel-400" aria-hidden="true" />
              <span className="text-surface-white font-bold">Executive Analytics Dashboard</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navyLight border border-white/15 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-teal shrink-0" aria-hidden="true" />
              <span className="text-surface-white font-semibold">{adminName}</span>
              {adminEmail ? (
                <span className="text-stillage-sky hidden sm:inline">({adminEmail})</span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-surface-white">
                Executive Analytics Dashboard
              </h1>
              <p className="text-steel-200 text-sm sm:text-base mt-1.5 leading-relaxed">
                Plain-English overview powered by live Stripe orders and Google Analytics site traffic.
              </p>
            </div>

            {lastUpdatedText ? (
              <div className="text-xs font-mono text-steel-200 shrink-0">
                Updated {lastUpdatedText}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Top Control Strip */}
      <div className="bg-steel-50 border-b border-steel-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-steel-600 font-bold">
              Period:
            </span>
            <div
              role="group"
              aria-label="Analytics time period"
              className="inline-flex items-center gap-1.5"
            >
              {RANGE_OPTIONS.map((option) => {
                const isSelected = activeRange === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    title={option.description}
                    onClick={() => handleRangeChange(option.value)}
                    className={`px-3.5 py-1.5 rounded-full font-display font-bold text-sm transition-colors ${
                      isSelected
                        ? 'bg-stillage-blue text-surface-white shadow-sm'
                        : 'bg-surface-white text-brand-navy border border-steel-200 hover:border-stillage-blue'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5" aria-label="Live data sources">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border whitespace-nowrap ${sourceBadges.stripeClassName}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                <span>{sourceBadges.stripeLabel}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border whitespace-nowrap ${sourceBadges.gaClassName}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                <span>{sourceBadges.gaLabel}</span>
              </span>
            </div>

            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-stillage-blue font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Updating&hellip;</span>
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRangeChange(activeRange, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-white border border-steel-200 hover:border-stillage-blue text-brand-navy text-xs sm:text-sm font-display font-bold transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-stillage-blue ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </button>

            <Link
              href="/analytics-report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-white border border-steel-200 hover:border-stillage-blue text-brand-navy text-xs sm:text-sm font-display font-bold transition-colors whitespace-nowrap"
            >
              <span>SEO &amp; GEO Health Monitor</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
            </Link>

            <a
              href={`/api/admin/analytics?range=${activeRange}&format=csv`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-brand-navy hover:bg-brand-navyLight text-surface-white text-xs sm:text-sm font-display font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-stillage-sky" aria-hidden="true" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main 4-Zone Content */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-opacity duration-150 ${
          isLoading ? 'opacity-75' : 'opacity-100'
        }`}
      >
        {error ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 bg-surface-white border border-accent-amber/40 rounded-lg px-4 py-3 text-sm text-steel-900 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-accent-amber shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            {authExpired ? (
              <Link
                href="/login?callbackUrl=/admin/analytics"
                className="font-display font-bold text-stillage-blue hover:underline"
              >
                Sign in again &rarr;
              </Link>
            ) : null}
          </div>
        ) : null}

        {data.sources && (!stripeLive || !gaLive) ? (
          <div className="bg-surface-white border border-steel-200 rounded-lg px-4 py-3 text-xs text-steel-700 shadow-sm flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="font-mono font-bold uppercase text-brand-navy">
                Data Source Fallback Active
              </div>
              <p className="leading-relaxed">
                {!stripeLive ? (
                  <span>
                    <strong>Stripe:</strong>{' '}
                    {data.sources.stripe.status === 'error'
                      ? `Could not reach Stripe API (${data.sources.stripe.message || 'network unavailable'}). Showing local fallback orders meanwhile.`
                      : 'Add STRIPE_SECRET_KEY to stream live card orders and proforma invoices. Showing local fallback meanwhile.'}{' '}
                  </span>
                ) : null}
                {!gaLive ? (
                  <span>
                    <strong>Google Analytics 4:</strong>{' '}
                    {data.sources.googleAnalytics.status === 'error'
                      ? `Could not reach GA4 API (${data.sources.googleAnalytics.message || 'network unavailable'}). Showing local fallback events meanwhile.`
                      : 'Run npm run ga4:setup (or set NEXT_PUBLIC_GA_MEASUREMENT_ID, GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY) to stream live site visitors, pages, locations & device splits. Showing local fallback meanwhile.'}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ) : null}

        {/* Zone 1: 4 Headline KPI Cards */}
        <section aria-label="Key performance metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Total Revenue (Ex. VAT) */}
            <div className="bg-surface-white border border-steel-200 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wide font-bold text-steel-600 whitespace-nowrap">
                  Total Revenue (Ex. VAT)
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-stillage-blue/10 text-stillage-blue font-mono text-[10px] font-bold">
                    {stripeLive ? 'Stripe' : 'Local'}
                  </span>
                  <span className="p-1.5 rounded-md bg-stillage-blue/10 text-stillage-blue">
                    <PoundSterling className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div>
                <div className="font-display font-extrabold text-3xl text-brand-navy tabular-nums">
                  {formatGbp(kpis.revenueExVatPence)}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {renderDeltaPill(kpis.revenueChangePct, data.range)}
                  {kpis.revenueChangePct !== null ? (
                    <span className="text-xs text-steel-600">vs previous period</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* KPI 2: Orders & Proformas */}
            <div className="bg-surface-white border border-steel-200 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wide font-bold text-steel-600 whitespace-nowrap">
                  Orders &amp; Proformas
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-stillage-blue/10 text-stillage-blue font-mono text-[10px] font-bold">
                    {stripeLive ? 'Stripe' : 'Local'}
                  </span>
                  <span className="p-1.5 rounded-md bg-stillage-blue/10 text-stillage-blue">
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div>
                <div className="font-display font-extrabold text-3xl text-brand-navy tabular-nums">
                  {kpis.totalOrders.toLocaleString('en-GB')}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-steel-600 font-semibold">
                    {kpis.cardOrders} Card · {kpis.proformaOrders} Proforma
                  </span>
                  {kpis.ordersChangePct !== null
                    ? renderDeltaPill(kpis.ordersChangePct, data.range)
                    : null}
                </div>
              </div>
            </div>

            {/* KPI 3: Website Visitors (GA4) */}
            <div className="bg-surface-white border border-steel-200 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wide font-bold text-steel-600 whitespace-nowrap">
                  Website Visitors
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-accent-teal/10 text-accent-teal font-mono text-[10px] font-bold">
                    {gaLive ? 'GA4' : 'Local'}
                  </span>
                  <span className="p-1.5 rounded-md bg-accent-teal/10 text-accent-teal">
                    <Globe className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div>
                <div className="font-display font-extrabold text-3xl text-brand-navy tabular-nums">
                  {kpis.siteVisitors.toLocaleString('en-GB')}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-steel-600 font-semibold">
                    {kpis.siteSessions.toLocaleString('en-GB')} sessions ·{' '}
                    {kpis.pageViews.toLocaleString('en-GB')} views
                  </span>
                  {kpis.visitorsChangePct !== null
                    ? renderDeltaPill(kpis.visitorsChangePct, data.range)
                    : null}
                </div>
                {gaLive &&
                (typeof kpis.engagementRatePct === 'number' ||
                  typeof kpis.avgSessionDurationSec === 'number') ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-mono text-steel-600">
                    {typeof kpis.engagementRatePct === 'number' ? (
                      <span>{kpis.engagementRatePct}% engaged</span>
                    ) : null}
                    {typeof kpis.engagementRatePct === 'number' &&
                    typeof kpis.avgSessionDurationSec === 'number' ? (
                      <span aria-hidden="true">·</span>
                    ) : null}
                    {typeof kpis.avgSessionDurationSec === 'number' ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-accent-teal" aria-hidden="true" />
                        <span>{formatDurationSeconds(kpis.avgSessionDurationSec)} avg</span>
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {/* KPI 4: Quote Pipeline & Buyers */}
            <div className="bg-surface-white border border-steel-200 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wide font-bold text-steel-600 whitespace-nowrap">
                  Quote Pipeline &amp; Buyers
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-steel-100 text-steel-700 font-mono text-[10px] font-bold">
                    {stripeLive && gaLive ? 'Stripe+GA4' : 'Combined'}
                  </span>
                  <span className="p-1.5 rounded-md bg-stillage-blue/10 text-stillage-blue">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div>
                <div className="font-display font-extrabold text-3xl text-brand-navy tabular-nums">
                  {formatGbp(kpis.quotePipelineExVatPence)}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-steel-600 font-semibold">
                  <span>
                    {kpis.quoteCount.toLocaleString('en-GB')}{' '}
                    {kpis.quoteCount === 1 ? 'quote' : 'quotes'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-brand-navy">
                    <Users className="w-3.5 h-3.5 text-stillage-blue" aria-hidden="true" />
                    <span>
                      {kpis.totalCustomers.toLocaleString('en-GB')} buyers (+
                      {kpis.newCustomers.toLocaleString('en-GB')})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zone 2: Clean SVG Revenue & Visitors Trend Chart */}
        <RevenueTrendChart trendSeries={data.trendSeries} range={data.range} gaLive={gaLive} />

        {/* Zone 3: Two-Column Operational Clarity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left (7 cols): Top 5 In-Demand Stillages */}
          <section
            aria-labelledby="top-stillages-heading"
            className="lg:col-span-7 bg-surface-white border border-steel-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 bg-steel-50 border-b border-steel-200 flex flex-wrap items-center justify-between gap-2">
              <h2
                id="top-stillages-heading"
                className="font-display font-bold text-lg text-brand-navy flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-stillage-blue" aria-hidden="true" />
                <span>Top 5 In-Demand Stillages</span>
              </h2>
              <span className="text-xs font-mono text-steel-600">
                GA4 views &amp; quotes · Stripe units &amp; revenue
              </span>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-6 text-sm text-steel-600">
                No stillage views, quotes, or orders recorded in this period yet.
              </div>
            ) : (
              <ul className="divide-y divide-steel-200">
                {topProducts.map((product) => {
                  const demandScore = product.ordersUnits + product.quotes + product.views;
                  const barWidthPct = Math.max(
                    6,
                    Math.round((demandScore / maxDemandScore) * 100)
                  );
                  return (
                    <li key={product.sku} className="p-5 space-y-2.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="inline-block font-mono text-xs font-bold text-stillage-blue bg-stillage-blue/10 border border-stillage-blue/20 px-2 py-0.5 rounded">
                            {product.sku}
                          </span>
                          <h3 className="font-semibold text-sm text-brand-navy leading-snug">
                            {product.title}
                          </h3>
                        </div>

                        {product.revenueExVatPence > 0 ? (
                          <span className="font-mono text-xs font-bold text-brand-navy bg-steel-50 border border-steel-200 px-2.5 py-1 rounded tabular-nums shrink-0">
                            {formatGbp(product.revenueExVatPence)} Ex. VAT
                          </span>
                        ) : null}
                      </div>

                      <div
                        className="w-full h-2 bg-steel-100 rounded-full overflow-hidden"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full bg-stillage-blue rounded-full transition-all duration-300"
                          style={{ width: `${barWidthPct}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-3 font-mono text-steel-800">
                          <span>
                            <strong>{product.views.toLocaleString('en-GB')}</strong> views
                          </span>
                          <span className="text-steel-400" aria-hidden="true">
                            ·
                          </span>
                          <span>
                            <strong>{product.quotes.toLocaleString('en-GB')}</strong> quotes
                          </span>
                          <span className="text-steel-400" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-stillage-blue font-bold">
                            {product.ordersUnits.toLocaleString('en-GB')} units ordered
                          </span>
                        </div>
                        <span className="text-steel-600 font-mono">
                          {product.popularConfig}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Right (5 cols): Simple 4-Step Conversion Funnel & Top Channels */}
          <section
            aria-labelledby="conversion-funnel-heading"
            className="lg:col-span-5 bg-surface-white border border-steel-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 bg-steel-50 border-b border-steel-200 flex items-center justify-between gap-2">
              <h2
                id="conversion-funnel-heading"
                className="font-display font-bold text-lg text-brand-navy"
              >
                Simple 4-Step Conversion Funnel
              </h2>
              <span className="text-xs font-mono text-steel-600">
                GA4 traffic &rarr; Stripe orders
              </span>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {funnel.map((step, index) => {
                const prevCount = index > 0 ? funnel[index - 1].count : step.count;
                const stepToStepPct =
                  index === 0
                    ? step.count > 0
                      ? 100
                      : 0
                    : prevCount > 0
                      ? Math.min(100, Math.round((step.count / prevCount) * 1000) / 10)
                      : 0;
                const isFinalStep = step.step === 4;
                const barWidthPct =
                  step.count > 0 ? Math.max(6, step.conversionPct) : 0;

                return (
                  <div key={step.step} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            isFinalStep
                              ? 'bg-accent-teal text-surface-white'
                              : 'bg-brand-navy text-surface-white'
                          }`}
                        >
                          {step.step}
                        </span>
                        <span className="font-semibold text-sm text-brand-navy truncate">
                          {step.label}
                        </span>
                      </div>
                      <span className="font-display font-extrabold text-xl text-brand-navy tabular-nums">
                        {step.count.toLocaleString('en-GB')}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-steel-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFinalStep ? 'bg-accent-teal' : 'bg-stillage-blue'
                        }`}
                        style={{ width: `${barWidthPct}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold border ${
                          isFinalStep
                            ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/25'
                            : 'bg-steel-50 text-brand-navy border-steel-200'
                        }`}
                      >
                        {index === 0
                          ? `${stepToStepPct}% baseline`
                          : `${stepToStepPct}% from step ${step.step - 1}`}
                      </span>
                      <span className="text-steel-600">
                        {step.conversionPct}% of product views
                      </span>
                    </div>
                  </div>
                );
              })}

              {topChannels.length > 0 ? (
                <div className="pt-4 border-t border-steel-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-steel-600">
                    <span>Top Traffic Sources (GA4)</span>
                    <span>Share</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {topChannels.map((item) => (
                      <li
                        key={item.channel}
                        className="flex items-center justify-between gap-2 font-mono"
                      >
                        <span className="text-brand-navy font-semibold truncate">
                          {item.channel}
                        </span>
                        <span className="text-steel-600 shrink-0 tabular-nums">
                          {item.visitors.toLocaleString('en-GB')} visitors ·{' '}
                          <strong className="text-brand-navy">{item.sharePct}%</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {/* Zone 3.5: Google Analytics 4 Audience & Content Insights */}
        {gaLive ? (
          <section
            aria-labelledby="ga4-insights-heading"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <h2 id="ga4-insights-heading" className="sr-only">
              Google Analytics 4 Audience and Content Insights
            </h2>

            {/* Card 1: Top Viewed Pages */}
            <div className="bg-surface-white border border-steel-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 bg-steel-50 border-b border-steel-200 flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-base text-brand-navy flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent-teal" aria-hidden="true" />
                  <span>Top Viewed Pages</span>
                </h3>
                <span className="text-[11px] font-mono text-steel-600">GA4</span>
              </div>
              {topPages.length === 0 ? (
                <div className="p-5 text-xs text-steel-600">
                  No GA4 page views recorded for this period yet.
                </div>
              ) : (
                <ul className="divide-y divide-steel-200 text-xs">
                  {topPages.map((page) => (
                    <li
                      key={page.path}
                      className="px-5 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-brand-navy truncate" title={page.title}>
                          {page.title}
                        </div>
                        <div className="font-mono text-[11px] text-steel-600 truncate">
                          {page.path}
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono tabular-nums">
                        <div className="font-bold text-brand-navy">
                          {page.views.toLocaleString('en-GB')} views
                        </div>
                        <div className="text-[11px] text-steel-600">
                          {page.visitors.toLocaleString('en-GB')} visitors
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Card 2: Top Buyer Locations */}
            <div className="bg-surface-white border border-steel-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 bg-steel-50 border-b border-steel-200 flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-base text-brand-navy flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stillage-blue" aria-hidden="true" />
                  <span>Top Buyer Locations</span>
                </h3>
                <span className="text-[11px] font-mono text-steel-600">GA4</span>
              </div>
              {topRegions.length === 0 ? (
                <div className="p-5 text-xs text-steel-600">
                  No regional visitor data recorded for this period yet.
                </div>
              ) : (
                <div className="p-5 space-y-3.5 text-xs">
                  {topRegions.map((reg) => (
                    <div key={reg.label} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 font-mono">
                        <span className="font-semibold text-brand-navy truncate" title={reg.label}>
                          {reg.label}
                        </span>
                        <span className="text-steel-600 shrink-0 tabular-nums">
                          {reg.visitors.toLocaleString('en-GB')} ·{' '}
                          <strong className="text-brand-navy">{reg.sharePct}%</strong>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-steel-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stillage-blue rounded-full"
                          style={{ width: `${Math.max(4, Math.min(100, reg.sharePct))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 3: Device Split & Visitor Mix */}
            <div className="bg-surface-white border border-steel-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 bg-steel-50 border-b border-steel-200 flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-base text-brand-navy flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-stillage-blue" aria-hidden="true" />
                  <span>Device &amp; Audience Mix</span>
                </h3>
                <span className="text-[11px] font-mono text-steel-600">GA4</span>
              </div>
              <div className="p-5 space-y-4 text-xs flex-1 flex flex-col justify-between">
                {deviceBreakdown.length === 0 ? (
                  <p className="text-steel-600">
                    No device breakdown recorded for this period yet.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {deviceBreakdown.map((item) => (
                      <div key={item.device} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 font-mono">
                          <span className="font-semibold text-brand-navy">{item.device}</span>
                          <span className="text-steel-600 tabular-nums">
                            {item.sessions.toLocaleString('en-GB')} sessions ·{' '}
                            <strong className="text-brand-navy">{item.sharePct}%</strong>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-steel-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-teal rounded-full"
                            style={{ width: `${Math.max(4, Math.min(100, item.sharePct))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-steel-200 grid grid-cols-2 gap-3 font-mono">
                  <div className="bg-steel-50 border border-steel-200 rounded p-2.5">
                    <div className="text-[10px] uppercase text-steel-600 font-bold">
                      New Visitors
                    </div>
                    <div className="text-base font-display font-extrabold text-brand-navy tabular-nums mt-0.5">
                      {(kpis.newVisitors ?? 0).toLocaleString('en-GB')}
                    </div>
                  </div>
                  <div className="bg-steel-50 border border-steel-200 rounded p-2.5">
                    <div className="text-[10px] uppercase text-steel-600 font-bold">
                      Trade Desk Clicks
                    </div>
                    <div className="text-base font-display font-extrabold text-brand-navy tabular-nums mt-0.5">
                      {kpis.tradeContactClicks.toLocaleString('en-GB')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section
            aria-labelledby="ga4-setup-heading"
            className="bg-surface-white border border-steel-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-steel-50 border-b border-steel-200 flex flex-wrap items-center justify-between gap-2">
              <h2
                id="ga4-setup-heading"
                className="font-display font-bold text-base text-brand-navy flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-stillage-blue" aria-hidden="true" />
                <span>Connect Google Analytics 4 (GA4) for Live Site Telemetry</span>
              </h2>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-steel-100 text-steel-700 border border-steel-200">
                £0/month · Data API v1beta
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-brand-navy">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      gaMeasurementConfigured ? 'text-accent-teal' : 'text-steel-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span>1. Browser Tag (gtag.js)</span>
                </div>
                <p className="text-steel-700 leading-relaxed">
                  {gaMeasurementConfigured
                    ? 'NEXT_PUBLIC_GA_MEASUREMENT_ID is configured and firing page views & B2B configurator events.'
                    : 'Set NEXT_PUBLIC_GA_MEASUREMENT_ID (G-XXXXXXXXXX) to stream page views, configurator clicks, and quote events.'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-brand-navy">
                  <CheckCircle2 className="w-4 h-4 text-steel-400" aria-hidden="true" />
                  <span>2. Server Data API Reader</span>
                </div>
                <p className="text-steel-700 leading-relaxed">
                  Set <code className="font-mono text-brand-navy">GA4_PROPERTY_ID</code>,{' '}
                  <code className="font-mono text-brand-navy">GA4_CLIENT_EMAIL</code>, and{' '}
                  <code className="font-mono text-brand-navy">GA4_PRIVATE_KEY</code> with a GCP
                  Service Account granted <strong>Viewer</strong> access on your GA4 property.
                </p>
              </div>
              <div className="space-y-2 bg-steel-50 border border-steel-200 rounded-md p-3.5">
                <div className="font-mono font-bold text-brand-navy uppercase text-[11px]">
                  Guided Setup &amp; Live Verification
                </div>
                <pre className="font-mono text-[11px] bg-brand-navy text-surface-white px-3 py-2 rounded overflow-x-auto">
                  npm run ga4:setup
                </pre>
                <p className="text-[11px] text-steel-600 leading-snug">
                  Validates your GA4 credentials live, writes <code>.env.local</code>, and syncs
                  Netlify production env vars.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Zone 4: Recent Orders & Proformas Table */}
        <section
          aria-labelledby="recent-orders-heading"
          className="bg-surface-white border border-steel-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 bg-steel-50 border-b border-steel-200 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="recent-orders-heading"
              className="font-display font-bold text-lg text-brand-navy"
            >
              Recent Orders &amp; Proformas
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-steel-600">
              <span>{stripeLive ? 'Source: Stripe' : 'Source: Local fallback'}</span>
              <span aria-hidden="true">·</span>
              <span>
                Showing latest {recentOrders.length}{' '}
                {recentOrders.length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <caption className="sr-only">
                Recent card orders and B2B proforma invoices for the selected reporting period
              </caption>
              <thead>
                <tr className="bg-steel-50 border-b border-steel-200 font-mono text-xs uppercase text-steel-600">
                  <th scope="col" className="py-3 px-4 font-bold whitespace-nowrap">
                    Order Ref
                  </th>
                  <th scope="col" className="py-3 px-4 font-bold">
                    Customer / Company
                  </th>
                  <th scope="col" className="py-3 px-4 font-bold whitespace-nowrap">
                    Mode
                  </th>
                  <th scope="col" className="py-3 px-4 font-bold whitespace-nowrap">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4 font-bold text-right whitespace-nowrap">
                    Value (Ex. VAT)
                  </th>
                  <th scope="col" className="py-3 px-4 font-bold text-right whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-steel-600">
                      No orders or proforma invoices recorded in this period.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const modeBadge = formatPaymentMode(order.paymentMode);
                    const statusBadge = getOrderStatusBadge(order.status);

                    return (
                      <tr key={order.id} className="hover:bg-steel-50 transition-colors">
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="font-mono font-bold text-xs text-brand-navy">
                            {order.orderReference}
                          </div>
                          <div className="text-xs font-mono text-steel-600 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>
                              {order.totalUnits} {order.totalUnits === 1 ? 'unit' : 'units'}
                              {order.purchaseOrderNumber
                                ? ` · PO: ${order.purchaseOrderNumber}`
                                : ''}
                            </span>
                            {order.hostedInvoiceUrl ? (
                              <a
                                href={order.hostedInvoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-stillage-blue hover:underline font-bold"
                              >
                                <span>Invoice</span>
                                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-brand-navy">
                            {order.companyName || order.customerEmail}
                          </div>
                          <div className="text-xs text-steel-600 mt-0.5 flex flex-wrap items-center gap-2">
                            {order.companyName ? <span>{order.customerEmail}</span> : null}
                            {order.postcode ? (
                              <span className="font-mono text-steel-600">{order.postcode}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${modeBadge.className}`}
                          >
                            {modeBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top text-right font-mono font-bold text-brand-navy tabular-nums whitespace-nowrap">
                          {formatGbp(order.totalExVatPence)}
                        </td>
                        <td className="py-3.5 px-4 align-top text-right font-mono text-xs text-steel-600 whitespace-nowrap">
                          {formatUkDate(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
