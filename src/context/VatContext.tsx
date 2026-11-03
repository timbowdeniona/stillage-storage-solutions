'use client';

import React, { createContext, useContext, useState } from 'react';
import { UK_VAT_RATE } from '@/lib/pricing';

export interface OrderBasketItem {
  sku: string;
  title: string;
  slug: string;
  quantity: number;
  finishName: string;
  mobilityName: string;
  unitPriceExVatPence: number;
  lineTotalExVatPence: number;
}

interface VatContextValue {
  showIncVat: boolean;
  setShowIncVat: (val: boolean) => void;
  formatPrice: (exVatPence: number) => string;
  formatBothPrices: (exVatPence: number) => {
    primary: string;
    secondary: string;
    label: string;
  };
  basket: OrderBasketItem[];
  addToBasket: (item: OrderBasketItem) => void;
  clearBasket: () => void;
}

const VatContext = createContext<VatContextValue | undefined>(undefined);

export function formatGBP(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(pence / 100);
}

export function VatProvider({ children }: { children: React.ReactNode }) {
  // B2B industrial default: Ex. VAT shown first
  const [showIncVat, setShowIncVat] = useState(false);
  const [basket, setBasket] = useState<OrderBasketItem[]>([]);

  const formatPrice = (exVatPence: number) => {
    const amount = showIncVat ? Math.round(exVatPence * (1 + UK_VAT_RATE)) : exVatPence;
    return formatGBP(amount);
  };

  const formatBothPrices = (exVatPence: number) => {
    const incVatPence = Math.round(exVatPence * (1 + UK_VAT_RATE));
    if (showIncVat) {
      return {
        primary: formatGBP(incVatPence),
        secondary: `${formatGBP(exVatPence)} Ex. VAT`,
        label: 'Inc. VAT',
      };
    }
    return {
      primary: formatGBP(exVatPence),
      secondary: `${formatGBP(incVatPence)} Inc. VAT`,
      label: 'Ex. VAT',
    };
  };

  const addToBasket = (item: OrderBasketItem) => {
    setBasket((prev) => {
      const existingIdx = prev.findIndex(
        (x) =>
          x.sku === item.sku &&
          x.finishName === item.finishName &&
          x.mobilityName === item.mobilityName
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = item;
        return updated;
      }
      return [...prev, item];
    });
  };

  const clearBasket = () => setBasket([]);

  return (
    <VatContext.Provider
      value={{
        showIncVat,
        setShowIncVat,
        formatPrice,
        formatBothPrices,
        basket,
        addToBasket,
        clearBasket,
      }}
    >
      {children}
    </VatContext.Provider>
  );
}

export function useVat() {
  const ctx = useContext(VatContext);
  if (!ctx) {
    throw new Error('useVat must be used within a VatProvider');
  }
  return ctx;
}
