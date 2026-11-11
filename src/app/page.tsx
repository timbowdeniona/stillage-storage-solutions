import React from 'react';
import { getProducts } from '@/lib/contentful';
import { Approach3HomePage } from '@/components/redesign/Approach3HomePage';

export default async function HomePage() {
  const products = await getProducts();
  return <Approach3HomePage products={products} />;
}
