import React from 'react';
import { getProducts } from '@/lib/contentful';
import { Approach1HomePage } from '@/components/redesign/Approach1HomePage';

export default async function HomePage() {
  const products = await getProducts();
  return <Approach1HomePage products={products} />;
}
