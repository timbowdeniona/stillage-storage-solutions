import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { getBlogPosts, getProducts } from '@/lib/contentful';
import { resolveBlogPostSeo, resolveProductSeo } from '@/lib/seo';
import { EXECUTIVE_MONTHLY_REPORT_SAMPLE } from '@/lib/analytics';
import { AnalyticsReportClient } from '@/components/AnalyticsReportClient';

export const metadata: Metadata = {
  title: 'Executive SEO, GEO & Monthly Analytics Report (Client Dashboard)',
  description:
    'Plain-English 1-page executive analytics summary, Contentful SEO automatic fallback monitor, and Generative Engine Optimisation (GEO) health check for Stillage Storage Solutions.',
};

export default async function AnalyticsReportPage() {
  const [products, blogPosts] = await Promise.all([getProducts(), getBlogPosts()]);
  const report = EXECUTIVE_MONTHLY_REPORT_SAMPLE;

  return (
    <div>
      {/* Header Banner */}
      <div className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-mono text-steel-200 mb-4"
          >
            <Link href="/" className="hover:text-surface-sand">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-steel-400" />
            <span className="text-surface-sand font-bold">
              Client SEO, GEO &amp; Monthly Analytics Dashboard
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stillage-blue/30 border border-stillage-blueLight text-surface-sand font-mono text-xs uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5 text-accent-teal" />
                <span>Automated Monthly PDF Email + 1-Page Executive View</span>
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-wide">
                Plain-English Performance, SEO &amp; AI Search Report
              </h1>
              <p className="text-steel-200 text-sm sm:text-base leading-relaxed">
                Designed specifically for non-technical business owners. No complicated Google Analytics menus — see your visitors, quote requests, top stillages, and automatic Contentful SEO status on one page.
              </p>
            </div>

            <div className="bg-brand-navyDark border border-white/15 p-4 rounded-sm font-mono text-xs space-y-1.5 shrink-0">
              <div className="text-surface-sand font-bold uppercase">
                Delivery Schedule: 1st of Every Month
              </div>
              <div className="text-steel-200">Format: 1-Page Looker Studio PDF + Live Link</div>
              <div className="text-accent-teal">Status: 100% Contentful Pages Indexed &amp; Optimized</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Section 1: 1-Page Executive Analytics Scorecard */}
        <section aria-labelledby="executive-scorecard-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
                1. MONTHLY EXECUTIVE SCORECARD ({report.periodLabel})
              </div>
              <h2
                id="executive-scorecard-heading"
                className="font-display font-extrabold text-2xl sm:text-3xl uppercase text-brand-navy mt-1"
              >
                Headline Trade Website Numbers
              </h2>
            </div>
            <div className="font-mono text-xs text-steel-600 bg-surface-sandLight px-3.5 py-2 border border-steel-200 rounded-sm">
              {report.scheduledDelivery}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {report.kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="border-2 border-brand-navy bg-surface-white p-5 rounded-sm shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="font-mono text-xs uppercase text-steel-600 font-bold">
                    {kpi.label}
                  </div>
                  <div className="font-display font-extrabold text-4xl text-brand-navy mt-1">
                    {kpi.value}
                  </div>
                  <div className="inline-block mt-1 font-mono text-xs font-bold text-stillage-blue bg-surface-sandLight px-2 py-0.5 rounded-sm">
                    {kpi.change}
                  </div>
                </div>
                <p className="text-xs text-steel-700 leading-relaxed pt-2 border-t border-steel-200">
                  {kpi.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Top Products & Top Search Queries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            {/* Top 5 Most Viewed & Quoted Stillages */}
            <div className="lg:col-span-7 border border-steel-200 bg-surface-white rounded-sm overflow-hidden">
              <div className="bg-brand-navy text-surface-white px-5 py-3.5 flex items-center justify-between">
                <span className="font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-surface-sand" />
                  Top 5 In-Demand Stillages &amp; Configurations
                </span>
                <span className="font-mono text-xs text-surface-sand">Sorted by Quote Volume</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-sandLight border-b border-steel-200 font-mono uppercase text-steel-600">
                      <th className="py-2.5 px-4">Product / SKU</th>
                      <th className="py-2.5 px-4">Views</th>
                      <th className="py-2.5 px-4">Quotes</th>
                      <th className="py-2.5 px-4">Most Popular Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel-200">
                    {report.topProducts.map((item) => (
                      <tr key={item.sku} className="hover:bg-surface-sandLight/30">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-stillage-blue">{item.sku}</div>
                          <div className="font-semibold text-brand-navy">{item.title}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-steel-900">
                          {item.views.toLocaleString('en-GB')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-brand-navy">
                          {item.quotes}
                        </td>
                        <td className="py-3 px-4 font-mono text-steel-700">
                          {item.mostPopularConfig}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Search Terms & UK Geographic Demand */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-steel-200 bg-surface-white rounded-sm overflow-hidden">
                <div className="bg-brand-navy text-surface-white px-5 py-3 flex items-center justify-between">
                  <span className="font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <Search className="w-4 h-4 text-surface-sand" />
                    What UK Buyers Typed Into Google &amp; AI
                  </span>
                </div>
                <div className="divide-y divide-steel-200 text-xs">
                  {report.topSearchTerms.map((term) => (
                    <div
                      key={term.query}
                      className="p-3.5 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-mono font-bold text-brand-navy">
                          &ldquo;{term.query}&rdquo;
                        </div>
                        <div className="text-[11px] text-steel-600">{term.source}</div>
                      </div>
                      <span className="font-mono font-bold text-stillage-blue bg-surface-sandLight px-2.5 py-1 rounded-sm border border-steel-200">
                        {term.clicks} clicks
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-steel-200 bg-surface-white rounded-sm overflow-hidden">
                <div className="bg-brand-navy text-surface-white px-5 py-3 flex items-center justify-between">
                  <span className="font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-surface-sand" />
                    Top UK Regional Buyer Demand
                  </span>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  {report.topUkRegions.map((reg) => (
                    <div key={reg.region} className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-steel-900 font-semibold">{reg.region}</span>
                        <span className="font-bold text-brand-navy">{reg.sharePercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-sandLight rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stillage-blue"
                          style={{ width: `${reg.sharePercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Session Event Tester */}
          <AnalyticsReportClient />
        </section>

        {/* Section 2: Automated Contentful SEO & GEO Monitor */}
        <section aria-labelledby="contentful-seo-audit-heading" className="space-y-6 pt-6 border-t border-steel-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
                2. ZERO-EFFORT CONTENTFUL SEO &amp; GEO HEALTH MONITOR
              </div>
              <h2
                id="contentful-seo-audit-heading"
                className="font-display font-extrabold text-2xl sm:text-3xl uppercase text-brand-navy mt-1"
              >
                How Automatic SEO Fallbacks Protect Your Rankings
              </h2>
              <p className="text-xs sm:text-sm text-steel-700 mt-1 max-w-3xl">
                When you add a new stillage or technical article in Contentful, you <strong>do not need to write technical SEO code</strong>. If you leave the optional SEO fields blank, the website automatically generates your Google Title, Meta Description, Social Share Card, and FAQ Rich Snippets.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 font-mono text-xs">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-surface-sandLight hover:bg-surface-sand text-brand-navy font-bold px-3.5 py-2 border border-steel-200 rounded-sm"
              >
                <Globe className="w-3.5 h-3.5 text-stillage-blue" />
                <span>/sitemap.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-surface-sandLight hover:bg-surface-sand text-brand-navy font-bold px-3.5 py-2 border border-steel-200 rounded-sm"
              >
                <Bot className="w-3.5 h-3.5 text-accent-teal" />
                <span>/llms.txt (AI Search Feed)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/llms-full.txt"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-surface-sandLight hover:bg-surface-sand text-brand-navy font-bold px-3.5 py-2 border border-steel-200 rounded-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-stillage-blue" />
                <span>/llms-full.txt</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="border border-steel-200 bg-surface-white rounded-sm overflow-hidden shadow-sm">
            <div className="bg-brand-navy text-surface-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-teal" />
                Live Contentful Products &amp; Guides — Google &amp; AI Search Status ({products.length + blogPosts.length} Pages)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-sandLight border-b border-steel-200 font-mono uppercase text-steel-600">
                    <th className="py-3 px-4">Contentful Entry</th>
                    <th className="py-3 px-4">Resolved Google Title &amp; Meta Description</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Schemas Active</th>
                    <th className="py-3 px-4">Social Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-200">
                  {products.map((prod) => {
                    const seo = resolveProductSeo(prod);
                    return (
                      <tr key={prod.id} className="hover:bg-surface-sandLight/30">
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono font-bold text-stillage-blue">{prod.sku}</span>
                          <div className="font-semibold text-brand-navy mt-0.5">
                            <Link href={`/products/${prod.slug}`} className="hover:underline">
                              {prod.title}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top max-w-md">
                          <div className="font-bold text-brand-navy">{seo.title}</div>
                          <div className="text-steel-600 mt-1 leading-snug">{seo.description}</div>
                        </td>
                        <td className="py-3.5 px-4 align-top font-mono">
                          <span className="inline-flex items-center gap-1 bg-surface-sandLight text-brand-navy px-2 py-0.5 rounded-sm border border-steel-200 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-accent-teal" />
                            {seo.usedFallbackTitle ? 'Smart Auto-Fallback' : 'Custom Editor SEO'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top font-mono text-[11px] text-steel-800">
                          Product • Offer • FAQPage • Breadcrumb
                        </td>
                        <td className="py-3.5 px-4 align-top font-mono">
                          <a
                            href={seo.ogImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-stillage-blue hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <span>View Card</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}

                  {blogPosts.map((post) => {
                    const seo = resolveBlogPostSeo(post);
                    return (
                      <tr key={post.id} className="hover:bg-surface-sandLight/30">
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono font-bold text-accent-teal">BLOG GUIDE</span>
                          <div className="font-semibold text-brand-navy mt-0.5">
                            <Link href={`/blog/${post.slug}`} className="hover:underline">
                              {post.title}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top max-w-md">
                          <div className="font-bold text-brand-navy">{seo.title}</div>
                          <div className="text-steel-600 mt-1 leading-snug">{seo.description}</div>
                        </td>
                        <td className="py-3.5 px-4 align-top font-mono">
                          <span className="inline-flex items-center gap-1 bg-surface-sandLight text-brand-navy px-2 py-0.5 rounded-sm border border-steel-200 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-accent-teal" />
                            {seo.usedFallbackTitle ? 'Smart Auto-Fallback' : 'Custom Editor SEO'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top font-mono text-[11px] text-steel-800">
                          TechArticle • FAQPage • Breadcrumb
                        </td>
                        <td className="py-3.5 px-4 align-top font-mono">
                          <a
                            href={seo.ogImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-stillage-blue hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <span>View Card</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
