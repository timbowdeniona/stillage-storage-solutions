'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Bell, CheckCircle2, Sparkles } from 'lucide-react';
import {
  B2BAnalyticsEventPayload,
  getRecentB2BEvents,
  trackB2BEvent,
} from '@/lib/analytics';

export function AnalyticsReportClient() {
  const [recentEvents, setRecentEvents] = useState<B2BAnalyticsEventPayload[]>([]);

  useEffect(() => {
    setRecentEvents(getRecentB2BEvents());
    const handler = () => {
      setRecentEvents(getRecentB2BEvents());
    };
    window.addEventListener('sss-analytics-event', handler);
    return () => window.removeEventListener('sss-analytics-event', handler);
  }, []);

  const handleSimulateEvent = () => {
    trackB2BEvent({
      event: 'quote_or_proforma_submitted',
      sku: 'SSS-CANT-3B8A',
      productTitle: '3-Bay Double-Sided Heavy Duty Cantilever Bar & Pipe Stillage Rack',
      quantity: 8,
      discountPercentage: 5,
      totalExVatPence: 292600,
      paymentMethod: 'proforma_invoice',
    });
  };

  return (
    <div className="border-2 border-brand-navy bg-surface-white p-6 rounded-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-steel-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-stillage-blue font-bold">
            <Activity className="w-4 h-4 text-accent-teal" />
            <span>Live Session Event Inspector (GA4 &amp; Plausible Feed)</span>
          </div>
          <h3 className="font-display font-extrabold text-xl uppercase text-brand-navy mt-1">
            Real-Time B2B Conversion Events Captured
          </h3>
          <p className="text-xs text-steel-600">
            Every configurator choice, bulk tier click, and proforma request is automatically sent to your monthly executive report.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateEvent}
          className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-sm inline-flex items-center gap-2 shrink-0 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate Trade Proforma Event</span>
        </button>
      </div>

      {recentEvents.length === 0 ? (
        <div className="bg-surface-sandLight border border-steel-200 p-4 rounded-sm flex items-center justify-between text-xs font-mono text-steel-700">
          <span>
            No events triggered in this browser tab yet. Configure a stillage or click &ldquo;Simulate Trade Proforma Event&rdquo; above to see live tracking.
          </span>
        </div>
      ) : (
        <div className="divide-y divide-steel-200 max-h-64 overflow-y-auto">
          {recentEvents.map((ev, idx) => (
            <div
              key={`${ev.timestamp}-${idx}`}
              className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" />
                <span className="bg-brand-navy text-surface-sand px-2 py-0.5 rounded-sm font-bold">
                  {ev.event}
                </span>
                {ev.sku && <span className="font-bold text-stillage-blue">{ev.sku}</span>}
                {ev.optionType && (
                  <span className="text-steel-700">
                    ({ev.optionType}: {String(ev.optionValue)})
                  </span>
                )}
                {ev.paymentMethod && (
                  <span className="text-brand-navy font-bold">
                    [{ev.paymentMethod.replace('_', ' ').toUpperCase()}]
                  </span>
                )}
              </div>
              <div className="text-steel-600">
                {ev.totalExVatPence
                  ? `£${(ev.totalExVatPence / 100).toFixed(2)} Ex. VAT`
                  : ev.quantity
                  ? `${ev.quantity} units`
                  : 'Tracked'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-brand-navy text-surface-sand p-3.5 rounded-sm flex items-center gap-3 text-xs font-mono">
        <Bell className="w-4 h-4 text-accent-amber shrink-0" />
        <span>
          <strong>Zero Login Needed for Client:</strong> Looker Studio automatically emails these metrics as a 1-page visual PDF to the client&apos;s inbox on the 1st of every month.
        </span>
      </div>
    </div>
  );
}
