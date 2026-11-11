import React from 'react';
import { getProducts } from '@/lib/contentful';
import { Approach2HomePage } from '@/components/redesign/Approach2HomePage';

export default async function HomePage() {
  const products = await getProducts();
  return <Approach2HomePage products={products} />;
}
