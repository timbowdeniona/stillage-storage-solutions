import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/types/catalog';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group border border-steel-200 hover:border-stillage-blue bg-surface-white flex flex-col justify-between transition-all shadow-sm hover:shadow-md">
      <div>
        {/* Category & Reading Time Header Bar */}
        <div className="px-4 py-2.5 bg-steel-100 border-b border-steel-200 flex items-center justify-between gap-2 font-mono text-[11px]">
          <span className="font-bold text-stillage-blue uppercase tracking-wider truncate">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 text-steel-600 shrink-0">
            <Clock className="w-3 h-3" />
            {post.readingTimeMinutes} min read
          </span>
        </div>

        {/* Studio Image Stage */}
        <Link
          href={`/blog/${post.slug}`}
          className={`block h-48 p-5 flex items-center justify-center relative border-b border-steel-200 transition-colors ${
            post.backdropStyle === 'sand'
              ? 'bg-surface-sand/75 group-hover:bg-surface-sand'
              : 'bg-surface-white group-hover:bg-surface-sand/40'
          }`}
        >
          {post.featured && (
            <span className="absolute top-3 left-3 bg-brand-navy text-surface-sand font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm">
              Featured Guide
            </span>
          )}
          <img
            src={post.heroImage}
            alt={post.title}
            loading="lazy"
            width={320}
            height={200}
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Copy & Metadata */}
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-steel-600">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stillage-blue" />
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-accent-teal" />
              {post.author}
            </span>
          </div>

          <h3 className="heading-balance font-display font-bold text-xl uppercase text-brand-navy group-hover:text-stillage-blue transition-colors leading-snug">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>

          <p className="text-xs text-steel-600 leading-relaxed line-clamp-3">{post.excerpt}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] bg-surface-sandLight border border-steel-200 text-steel-800 px-2 py-0.5 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 bg-surface-sandLight border-t border-steel-200 flex items-center justify-between font-mono text-xs font-bold text-stillage-blue">
        <Link href={`/blog/${post.slug}`} className="inline-flex items-center justify-between w-full">
          <span>Read Engineering Guide</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
