import React from 'react';
import { getFeaturedBlogPosts, getProducts } from '@/lib/contentful';
import { Approach1HomePage } from '@/components/redesign/Approach1HomePage';
import { FEATURES } from '@/lib/features';

export default async function HomePage() {
  const [products, featuredPosts] = await Promise.all([
    getProducts(),
    FEATURES.enableBlogGuides ? getFeaturedBlogPosts(3) : Promise.resolve([]),
  ]);
  return <Approach1HomePage products={products} featuredPosts={featuredPosts} />;
}
