import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { getBlogPosts } from '@/lib/contentful';
import { BlogCard } from '@/components/BlogCard';

export const metadata: Metadata = {
  title: 'Technical Blog & Industrial Stillage Engineering Guides',
  description:
    'UK engineering guides on steel stillage SWL compliance, PUWER 1998 inspections, BS EN ISO 1461 hot-dip galvanising, cantilever bar storage, and HGV pallet logistics.',
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  const leadPost = posts.find((p) => p.featured) || posts[0];
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div>
      {/* Page Header Banner */}
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
            <span className="text-surface-sand font-bold">Technical Blog &amp; Engineering Guides</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stillage-blue/30 border border-stillage-blueLight text-surface-sand font-mono text-xs uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-accent-teal" />
                <span>Contentful Managed Knowledge Base</span>
              </div>
              <h1 className="heading-balance font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-wide">
                Stillage Engineering, Safety &amp; Warehouse Guides
              </h1>
              <p className="text-steel-200 text-sm sm:text-base leading-relaxed">
                Practical technical guidance from our UK steel fabrication team covering Safe Working Loads (SWL), PUWER &amp; LOLER compliance, protective finishes, and high-density warehouse storage.
              </p>
            </div>

            <div className="bg-brand-navyDark border border-white/15 p-4 rounded-sm font-mono text-xs space-y-1 shrink-0">
              <div className="text-surface-sand font-bold uppercase">
                {posts.length} Published Engineering Guides
              </div>
              <div className="text-steel-200">
                Categories: {categories.length} Technical Topics
              </div>
              <div className="text-accent-teal text-[11px]">
                Reviewed by UK Steel Fabrication Engineers
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Featured Lead Article Stage */}
        {leadPost && (
          <section aria-labelledby="featured-guide-heading">
            <div className="flex items-center justify-between mb-4">
              <div
                id="featured-guide-heading"
                className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold"
              >
                FEATURED ENGINEERING GUIDE
              </div>
              <span className="font-mono text-xs text-steel-600">
                Contentful Content Type: <code className="font-bold text-brand-navy">blogPost</code>
              </span>
            </div>

            <div className="border-2 border-brand-navy bg-surface-white grid grid-cols-1 lg:grid-cols-12 shadow-md">
              {/* Left Image Showcase */}
              <div
                className={`lg:col-span-5 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-steel-200 ${
                  leadPost.backdropStyle === 'sand' ? 'bg-surface-sand' : 'bg-surface-sandLight'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="bg-brand-navy text-surface-sand px-2.5 py-1 font-bold uppercase rounded-sm">
                    {leadPost.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-brand-navy font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    {leadPost.readingTimeMinutes} min read
                  </span>
                </div>

                <div className="my-6 h-60 flex items-center justify-center">
                  <img
                    src={leadPost.heroImage}
                    alt={leadPost.title}
                    width={420}
                    height={300}
                    className="max-h-full object-contain drop-shadow-md"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-brand-navy/15">
                  {leadPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] bg-surface-white/90 text-brand-navy font-bold px-2.5 py-0.5 rounded-sm border border-brand-navy/15"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Article Summary & Takeaways */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-steel-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-stillage-blue" />
                      <time dateTime={leadPost.publishedAt}>{leadPost.publishedAt}</time>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-4 h-4 text-accent-teal" />
                      <span>
                        {leadPost.author} ({leadPost.authorRole})
                      </span>
                    </span>
                  </div>

                  <h2 className="heading-balance font-display font-extrabold text-2xl sm:text-4xl uppercase text-brand-navy leading-tight">
                    <Link
                      href={`/blog/${leadPost.slug}`}
                      className="hover:text-stillage-blue transition-colors"
                    >
                      {leadPost.title}
                    </Link>
                  </h2>

                  <p className="text-steel-800 text-sm sm:text-base leading-relaxed">
                    {leadPost.excerpt}
                  </p>

                  {leadPost.keyTakeaways.length > 0 && (
                    <div className="bg-surface-sandLight border border-steel-200 p-4 rounded-sm space-y-2">
                      <div className="font-mono text-xs font-bold uppercase text-brand-navy flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-accent-teal" />
                        Key Technical Takeaways
                      </div>
                      <ul className="space-y-1.5 text-xs text-steel-800">
                        {leadPost.keyTakeaways.slice(0, 3).map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-stillage-blue shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-steel-200 flex flex-wrap items-center justify-between gap-4">
                  <Link
                    href={`/blog/${leadPost.slug}`}
                    className="bg-stillage-blue hover:bg-stillage-blueDark text-white font-display font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-sm inline-flex items-center gap-2 transition-colors"
                  >
                    <span>Read Full Engineering Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {leadPost.relatedProductSkus.length > 0 && (
                    <div className="font-mono text-xs text-steel-600">
                      Referenced SKUs:{' '}
                      <span className="font-bold text-brand-navy">
                        {leadPost.relatedProductSkus.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All Blog Posts Grid */}
        <section aria-labelledby="all-guides-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-stillage-blue font-bold">
                ALL TECHNICAL ARTICLES ({posts.length})
              </div>
              <h2
                id="all-guides-heading"
                className="font-display font-extrabold text-2xl sm:text-3xl uppercase text-brand-navy mt-1"
              >
                Warehouse Storage &amp; Steel Fabrication Library
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="font-mono text-xs bg-surface-sandLight border border-steel-200 text-brand-navy px-3 py-1.5 rounded-sm font-bold"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
