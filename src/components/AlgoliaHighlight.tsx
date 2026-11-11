import React from 'react';
import { AlgoliaHighlightField } from '@/types/catalog';

interface AlgoliaHighlightProps {
  fallbackText: string;
  highlightField?: AlgoliaHighlightField | AlgoliaHighlightField[];
}

/**
 * Safely renders Algolia `_highlightResult` strings (`<mark>...</mark>` or `<em>...</em>`)
 * into pure React nodes without `dangerouslySetInnerHTML` or `innerHTML`.
 */
export function AlgoliaHighlight({ fallbackText, highlightField }: AlgoliaHighlightProps) {
  const singleField = Array.isArray(highlightField) ? highlightField[0] : highlightField;
  const rawValue = singleField?.value;

  if (!rawValue || (!rawValue.includes('<mark>') && !rawValue.includes('<em>'))) {
    return <>{fallbackText}</>;
  }

  const normalized = rawValue
    .replace(/<em>/g, '<mark>')
    .replace(/<\/em>/g, '</mark>')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const segments = normalized.split(/(<mark>.*?<\/mark>)/g);

  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.startsWith('<mark>') && seg.endsWith('</mark>')) {
          return (
            <mark
              key={idx}
              className="bg-surface-sand text-brand-navy font-bold px-0.5 underline decoration-stillage-blue decoration-2 rounded-sm"
            >
              {seg.slice(6, -7)}
            </mark>
          );
        }
        return <React.Fragment key={idx}>{seg}</React.Fragment>;
      })}
    </>
  );
}
