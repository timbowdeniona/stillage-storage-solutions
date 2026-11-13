'use client';

import React, { createContext, useContext } from 'react';
import {
  SEED_NAVIGATION_MENUS,
  SEED_SITE_MICROTEXTS,
} from '@/data/seedSiteContent';
import { NavigationMenuMap, SiteMicrotexts } from '@/types/content';

interface SiteContentContextValue {
  navigation: NavigationMenuMap;
  microtexts: SiteMicrotexts;
}

const SiteContentContext = createContext<SiteContentContextValue>({
  navigation: SEED_NAVIGATION_MENUS,
  microtexts: SEED_SITE_MICROTEXTS,
});

export function SiteContentProvider({
  navigation,
  microtexts,
  children,
}: {
  navigation: NavigationMenuMap;
  microtexts: SiteMicrotexts;
  children: React.ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={{ navigation, microtexts }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentContextValue {
  return useContext(SiteContentContext);
}
