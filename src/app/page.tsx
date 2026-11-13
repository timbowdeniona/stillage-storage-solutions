import React from 'react';
import type { Metadata } from 'next';
import {
  getFeaturedBlogPosts,
  getHomePageContent,
  getProducts,
} from '@/lib/contentful';
import { Approach1HomePage } from '@/components/redesign/Approach1HomePage';
import { FEATURES } from '@/lib/features';

export async function generateMetadata(): Promise<Metadata> {
  const homeContent = await getHomePageContent();

  return {
    title: homeContent.seoTitle,
    description: homeContent.seoDescription,
    openGraph: {
      title: homeContent.seoTitle,
      description: homeContent.seoDescription,
      ...(homeContent.ogImage
        ? {
            images: [
              {
                url: homeContent.ogImage,
                width: 1200,
                height: 630,
                alt: homeContent.heroImageAlt,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function HomePage() {
  const [products, featuredPosts, homeContent] = await Promise.all([
    getProducts(),
    FEATURES.enableBlogGuides ? getFeaturedBlogPosts(3) : Promise.resolve([]),
    getHomePageContent(),
  ]);
  return (
    <Approach1HomePage
      products={products}
      featuredPosts={featuredPosts}
      homeContent={homeContent}
    />
  );
}
