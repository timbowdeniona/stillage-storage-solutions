import React from 'react';
import { getFeaturedBlogPosts, getProducts } from '@/lib/contentful';
import { Approach1HomePage } from '@/components/redesign/Approach1HomePage';

export default async function HomePage() {
  const [products, featuredPosts] = await Promise.all([
    getProducts(),
    getFeaturedBlogPosts(3),
  ]);
  return <Approach1HomePage products={products} featuredPosts={featuredPosts} />;
}
