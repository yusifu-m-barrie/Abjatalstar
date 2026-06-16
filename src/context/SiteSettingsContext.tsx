"use client";

import { createContext, useContext, useMemo } from "react";
import type { SiteSettings } from "@/lib/content";

const SiteSettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  const settings = useContext(SiteSettingsContext);
  if (!settings) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return settings;
}

export function useBusiness() {
  const settings = useSiteSettings();
  return useMemo(
    () => ({
      name: settings.name,
      shortName: settings.shortName,
      tagline: settings.tagline,
      subtitle: settings.subtitle,
      description: settings.description,
      phone: settings.phone,
      phoneDisplay: settings.phoneDisplay,
      whatsapp: settings.whatsapp,
      email: settings.email,
      address: settings.address,
      founded: settings.founded,
      license: settings.license,
      logo: settings.logo,
    }),
    [settings]
  );
}

export function useBusinessHours() {
  const settings = useSiteSettings();
  return settings.hours;
}

export function useSocialLinks() {
  const settings = useSiteSettings();
  return settings.social;
}

export function useFooterContent() {
  const settings = useSiteSettings();
  return settings.footer;
}
