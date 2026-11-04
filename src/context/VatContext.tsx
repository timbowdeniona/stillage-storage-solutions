'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  UK_VAT_RATE,
  getBulkDiscountPercentage,
  getFinishModifierPence,
  getMobilityModifierPence,
} from '@/lib/pricing';
import { SEED_PRODUCTS } from '@/data/seedCatalog';

export interface OrderBasketItem {
  sku: string;
  title: string;
  slug: string;
  quantity: number;
  basePriceExVatPence?: number;
  finishOption?: string;
  finishName: string;
  mobilityOption?: string;
  mobilityName: string;
  primaryImage?: string;
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
  updateBasketItemQuantity: (index: number, quantity: number) => void;
  removeFromBasket: (index: number) => void;
  clearBasket: () => void;
  deliveryPostcode: string;
  setDeliveryPostcode: (postcode: string) => void;
  requiresTailLift: boolean;
  setRequiresTailLift: (val: boolean) => void;
}

const STORAGE_KEY = 'sss_order_basket_v1';

const VatContext = createContext<VatContextValue | undefined>(undefined);

export function formatGBP(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(pence / 100);
}

function recalculateBasketItem(item: OrderBasketItem, newQty: number): OrderBasketItem {
  const safeQty = Math.max(1, Math.floor(newQty || 1));
  const catalogProd = SEED_PRODUCTS.find((p) => p.sku === item.sku);
  const basePrice =
    item.basePriceExVatPence ?? catalogProd?.basePriceExVatPence ?? item.unitPriceExVatPence;
  const finishOpt = item.finishOption || 'standard-blue';
  const mobilityOpt = item.mobilityOption || 'standard-feet';

  const configuredUnit = Math.max(
    1000,
    basePrice + getFinishModifierPence(finishOpt) + getMobilityModifierPence(mobilityOpt)
  );
  const discountPct = getBulkDiscountPercentage(safeQty);
  const discountedUnit = Math.round(configuredUnit * (1 - discountPct / 100));

  return {
    ...item,
    basePriceExVatPence: basePrice,
    finishOption: finishOpt,
    mobilityOption: mobilityOpt,
    primaryImage: item.primaryImage || catalogProd?.primaryImage,
    quantity: safeQty,
    unitPriceExVatPence: discountedUnit,
    lineTotalExVatPence: discountedUnit * safeQty,
  };
}

export function VatProvider({ children }: { children: React.ReactNode }) {
  // B2B industrial default: Ex. VAT shown first
  const [showIncVat, setShowIncVat] = useState(false);
  const [basket, setBasket] = useState<OrderBasketItem[]>([]);
  const [deliveryPostcode, setDeliveryPostcode] = useState<string>('B1 1AA');
  const [requiresTailLift, setRequiresTailLift] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.basket)) {
          setBasket(parsed.basket);
        }
        if (typeof parsed.deliveryPostcode === 'string' && parsed.deliveryPostcode.trim()) {
          setDeliveryPostcode(parsed.deliveryPostcode);
        }
        if (typeof parsed.requiresTailLift === 'boolean') {
          setRequiresTailLift(parsed.requiresTailLift);
        }
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          basket,
          deliveryPostcode,
          requiresTailLift,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [basket, deliveryPostcode, requiresTailLift, hydrated]);

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
    const normalizedItem = recalculateBasketItem(item, item.quantity);
    setBasket((prev) => {
      const existingIdx = prev.findIndex(
        (x) =>
          x.sku === normalizedItem.sku &&
          (x.finishOption || x.finishName) ===
            (normalizedItem.finishOption || normalizedItem.finishName) &&
          (x.mobilityOption || x.mobilityName) ===
            (normalizedItem.mobilityOption || normalizedItem.mobilityName)
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = normalizedItem;
        return updated;
      }
      return [...prev, normalizedItem];
    });
  };

  const updateBasketItemQuantity = (index: number, quantity: number) => {
    setBasket((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      updated[index] = recalculateBasketItem(updated[index], quantity);
      return updated;
    });
  };

  const removeFromBasket = (index: number) => {
    setBasket((prev) => prev.filter((_, idx) => idx !== index));
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
        updateBasketItemQuantity,
        removeFromBasket,
        clearBasket,
        deliveryPostcode,
        setDeliveryPostcode,
        requiresTailLift,
        setRequiresTailLift,
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
