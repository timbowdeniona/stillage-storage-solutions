import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldCheck,
  Tag,
  User,
} from 'lucide-react';
import { getBlogPostBySlug, getBlogPosts, getProducts } from '@/lib/contentful';
import {
  buildBlogPostMetadata,
  buildBlogPostSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  getBlogPostFaqs,
} from '@/lib/seo';
import { ProductCard } from '@/components/ProductCard';
import { BlogCard } from '@/components/BlogCard';

interface BlogPostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Technical Guide Not Found' };
  }
  return buildBlogPostMetadata(post);
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-brand-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="font-mono text-xs bg-surface-sandLight border border-steel-200 px-1.5 py-0.5 rounded-sm text-brand-navy"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderArticleBody(markdown: string) {
  const blocks = markdown.trim().split(/\n\n+/);
  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return (
        <h2
          key={index}
          className="font-display font-extrabold text-2xl sm:text-3xl uppercase text-brand-navy pt-4 pb-1 border-b border-steel-200"
        >
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3
          key={index}
          className="font-display font-bold text-xl uppercase text-brand-navy pt-3"
        >
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }
    const lines = trimmed.split('\n');
    if (lines.every((l) => l.trim().startsWith('- '))) {
      return (
        <ul key={index} className="space-y-2.5 pl-5 list-disc marker:text-stillage-blue text-steel-800">
          {lines.map((line, liIdx) => (
            <li key={liIdx} className="leading-relaxed">
              {renderInlineFormatting(line.trim().replace(/^-\s+/, ''))}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={index} className="text-steel-800 leading-relaxed text-base">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });
}

export default async function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const { slug } = await params;
  const [post, allPosts, allProducts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts(),
    getProducts(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedProducts = allProducts.filter((p) => post.relatedProductSkus.includes(p.sku));
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const articleJsonLd = buildBlogPostSchema(post);
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Technical Blog & Guides', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const faqJsonLd = buildFaqSchema(getBlogPostFaqs(post));

  return (
    <div>
      {/* Schema.org JSON-LD for Google Rich Results & AI Answer Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-surface-sandLight border-b border-steel-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-mono text-steel-600"
          >
            <Link href="/" className="hover:text-brand-navy">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-brand-navy">
              Technical Blog &amp; Guides
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-navy font-bold truncate max-w-md">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Hero Header */}
      <header className="bg-brand-navy text-surface-white border-b-4 border-stillage-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className="bg-stillage-blue text-white px-3 py-1 rounded-sm font-bold uppercase">
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-surface-sand">
                  <Calendar className="w-3.5 h-3.5" />
                  <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                </span>
                <span className="inline-flex items-center gap-1.5 text-steel-200">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTimeMinutes} min read
                </span>
              </div>

              <h1 className="heading-balance font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-tight">
                {post.title}
              </h1>

              <p className="text-steel-200 text-base sm:text-lg leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-surface-sand">
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-4 h-4 text-accent-teal" />
                  <strong>{post.author}</strong> — {post.authorRole}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div
                className={`p-6 rounded-sm border-2 border-surface-sandDark flex flex-col items-center justify-center ${
                  post.backdropStyle === 'sand' ? 'bg-surface-sand' : 'bg-surface-white'
                }`}
              >
                <img
                  src={post.heroImage}
                  alt={post.title}
                  width={340}
                  height={240}
                  className="h-48 object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content & Engineering Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Article Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Key Engineering Takeaways Box */}
            {post.keyTakeaways.length > 0 && (
              <section
                aria-label="Key Engineering Takeaways"
                className="bg-surface-sandLight border-l-4 border-stillage-blue border border-steel-200 p-6 rounded-sm space-y-3"
              >
                <div className="flex items-center gap-2 font-display font-bold text-lg uppercase text-brand-navy">
                  <ShieldCheck className="w-5 h-5 text-accent-teal" />
                  <span>Executive Engineering Summary &amp; Key Takeaways</span>
                </div>
                <ul className="space-y-2.5 text-sm text-steel-900">
                  {post.keyTakeaways.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-stillage-blue shrink-0 mt-1" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Formatted Article Body */}
            <article className="article-prose space-y-5">{renderArticleBody(post.body)}</article>

            {/* Technical Tags Footer */}
            {post.tags.length > 0 && (
              <div className="pt-6 border-t border-steel-200 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-brand-navy mr-2">
                  <Tag className="w-3.5 h-3.5 text-stillage-blue" />
                  Topics:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs bg-surface-sandLight border border-steel-200 text-brand-navy px-3 py-1 rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-stillage-blue hover:text-brand-navy"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Technical Guides</span>
              </Link>
            </div>
          </div>

          {/* Right Sidebar: Referenced Stillages & Trade Support */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="border border-steel-200 bg-surface-white p-5 space-y-4">
              <div className="font-mono text-xs uppercase text-stillage-blue font-bold">
                REFERENCED STILLAGE SPECS
              </div>
              <h2 className="font-display font-bold text-xl uppercase text-brand-navy">
                Configure Stillages From This Guide
              </h2>
              <div className="space-y-3">
                {relatedProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/products/${prod.slug}`}
                    className="block p-3 border border-steel-200 hover:border-stillage-blue bg-surface-sandLight/60 rounded-sm transition-colors group"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-steel-600">
                      <span className="font-bold text-brand-navy">{prod.sku}</span>
                      <span className="bg-brand-navy text-surface-sand px-2 py-0.5 rounded-sm font-bold">
                        {prod.swlKg}kg SWL
                      </span>
                    </div>
                    <div className="font-display font-bold text-sm uppercase text-brand-navy group-hover:text-stillage-blue mt-1">
                      {prod.title}
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-xs text-stillage-blue font-bold">
                      <span>
                        {prod.externalLengthMm}×{prod.externalWidthMm}×{prod.externalHeightMm}mm
                      </span>
                      <span className="inline-flex items-center gap-1">
                        Configure <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-brand-navy text-surface-white p-6 border-l-4 border-stillage-blue space-y-3">
              <div className="font-mono text-xs uppercase text-surface-sand">
                BESPOKE UK FABRICATION
              </div>
              <h3 className="font-display font-bold text-xl uppercase">
                Need Custom Footprints or Crane-Lift LOLER Cages?
              </h3>
              <p className="text-xs text-steel-200 leading-relaxed">
                Our Wrexham &amp; Midlands steel fabrication team builds custom sheet stillages, automotive racks, and hot-dip galvanised post pallets to your exact CAD drawing.
              </p>
              <div className="pt-2 space-y-2">
                <Link
                  href="/products"
                  className="block w-full bg-stillage-blue hover:bg-stillage-blueLight text-white text-center font-display font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm text-xs transition-colors"
                >
                  Browse Standard Range
                </Link>
                <a
                  href="mailto:sales@stillagestoragesolutions.co.uk"
                  className="block w-full bg-surface-sand hover:bg-white text-brand-navy text-center font-display font-bold uppercase tracking-wider py-2.5 px-4 rounded-sm text-xs transition-colors"
                >
                  Email Engineering Desk
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Full Product Cards for Referenced Specifications */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-steel-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs uppercase text-stillage-blue font-bold">
                  DIRECT ONLINE CONFIGURATION
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase text-brand-navy mt-0.5">
                  Stillages Featured in This Technical Guide
                </h2>
              </div>
              <Link
                href="/products"
                className="font-display font-bold uppercase text-sm text-stillage-blue hover:underline"
              >
                View All Stillages &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* More Technical Guides */}
        {otherPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-steel-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs uppercase text-stillage-blue font-bold">
                  CONTENTFUL KNOWLEDGE BASE
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase text-brand-navy mt-0.5">
                  More Stillage Engineering &amp; Buying Guides
                </h2>
              </div>
              <Link
                href="/blog"
                className="font-display font-bold uppercase text-sm text-stillage-blue hover:underline"
              >
                All Guides &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPosts.map((other) => (
                <BlogCard key={other.id} post={other} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
