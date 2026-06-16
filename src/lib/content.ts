import { client, isSanityConfigured } from "@/sanity/client";
import { CMS_CACHE_TAG } from "@/sanity/live";
import { getImageUrl } from "@/sanity/image";
import {
  aboutPageQuery,
  branchesPageQuery,
  contactPageQuery,
  homePageQuery,
  servicesPageQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import {
  fallbackAbout,
  fallbackBranches,
  fallbackContact,
  fallbackHome,
  fallbackServices,
  fallbackSettings,
} from "@/lib/fallbacks";

// ─── Site Settings ───────────────────────────────────────────
export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  subtitle: string;
  description: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  address: string;
  founded: string;
  license: string;
  logo: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    summary: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  footer: {
    description: string;
    companyHeading: string;
    servicesHeading: string;
    contactHeading: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
}

type SanitySiteSettings = Omit<SiteSettings, "logo"> & {
  logo?: { asset?: { _ref: string } } | null;
};

async function fetchSanity<T>(query: string): Promise<T | null> {
  if (!isSanityConfigured) return null;
  try {
    return await client.fetch<T | null>(query, {}, { next: { tags: [CMS_CACHE_TAG] } });
  } catch {
    return null;
  }
}

function mapSettings(doc: SanitySiteSettings | null): SiteSettings {
  if (!doc) return fallbackSettings as SiteSettings;
  return {
    ...doc,
    logo: getImageUrl(doc.logo, fallbackSettings.logo),
    social: {
      facebook: doc.social?.facebook || fallbackSettings.social.facebook,
      twitter: doc.social?.twitter || fallbackSettings.social.twitter,
      instagram: doc.social?.instagram || fallbackSettings.social.instagram,
    },
    footer: { ...fallbackSettings.footer, ...doc.footer },
    hours: { ...fallbackSettings.hours, ...doc.hours },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await fetchSanity<SanitySiteSettings>(siteSettingsQuery);
  return mapSettings(doc);
}

// ─── Shared Data ─────────────────────────────────────────────
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface PartnerItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface BranchItem {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: { weekdays: string; saturday: string; sunday: string };
  services: string[];
  isMain?: boolean;
}

export interface AgentItem {
  id: string;
  name: string;
  city: string;
  location: string;
  phone: string;
  services: string[];
  isActive: boolean;
}

export interface WhyChooseItem {
  title: string;
  description: string;
  icon: string;
}

export interface StepItem {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export interface TrustBadgeItem {
  icon: string;
  label: string;
  sub: string;
  highlight?: string;
  accent: string;
}

export async function getServices(): Promise<ServiceItem[]> {
  const page = await fetchSanity<{ items?: ServiceItem[] }>(servicesPageQuery);
  return page?.items ?? fallbackServices.items;
}

export async function getPartners(): Promise<PartnerItem[]> {
  const page = await fetchSanity<{ partners?: PartnerItem[] }>(servicesPageQuery);
  return page?.partners ?? fallbackServices.partners;
}

export async function getBranches(): Promise<BranchItem[]> {
  const page = await fetchSanity<{ items?: BranchItem[] }>(branchesPageQuery);
  return page?.items ?? fallbackBranches.items;
}

export async function getAgents(): Promise<AgentItem[]> {
  const page = await fetchSanity<{ items?: AgentItem[] }>(
    `*[_type == "agentsPage"][0]{ items }`
  );
  return page?.items ?? (await import("@/lib/fallbacks")).fallbackAgents.items;
}

export async function getWhyChooseUs(): Promise<WhyChooseItem[]> {
  const home = await fetchSanity<HomePageContent>(homePageQuery);
  return home?.whyChooseUs?.items ?? fallbackHome.whyChooseUs.items;
}

export async function getHowItWorksSteps() {
  const home = await fetchSanity<HomePageContent>(homePageQuery);
  return home?.howItWorks?.steps ?? fallbackHome.howItWorks.steps;
}

// ─── Page Content ────────────────────────────────────────────
export interface PageHeader {
  badge: string;
  title: string;
  subtitle: string;
}

export interface HomePageContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    titleSuffix: string;
    primaryButton: string;
    secondaryButton: string;
    trustLabel: string;
    statsCard: {
      label: string;
      value: string;
      transactions: { label: string; amount: string; status: string }[];
      securityTitle: string;
      securityText: string;
    };
  };
  seo?: { title: string; description: string };
  trustBadges: TrustBadgeItem[];
  partners: { eyebrow: string; title: string; description: string };
  services: {
    eyebrow: string;
    title: string;
    description: string;
    limit: number;
    showViewAll: boolean;
    viewAllText: string;
  };
  whyChooseUs: {
    eyebrow: string;
    title: string;
    description: string;
    stats: {
      customers: string;
      customersLabel: string;
      branches: string;
      branchesLabel: string;
      partners: string;
      partnersLabel: string;
      years: string;
      yearsLabel: string;
    };
    items: WhyChooseItem[];
  };
  branches: {
    eyebrow: string;
    title: string;
    description: string;
    limit: number;
    showViewAll: boolean;
    viewAllText: string;
    bannerText: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    compact: boolean;
    linkText: string;
    steps: { sending: StepItem[]; receiving: StepItem[] };
  };
  contact: { eyebrow: string; title: string; description: string };
  howItWorksPage: {
    seo: { title: string; description: string };
    header: PageHeader;
    section: {
      eyebrow: string;
      title: string;
      description: string;
      sendingTitle: string;
      receivingTitle: string;
    };
    cta: {
      title: string;
      description: string;
      primaryButton: string;
      secondaryButton: string;
    };
  };
}

export async function getHomePage(): Promise<HomePageContent> {
  const doc = await fetchSanity<HomePageContent>(homePageQuery);
  return doc ?? (fallbackHome as HomePageContent);
}

export async function getAboutPage() {
  const doc = await fetchSanity<typeof fallbackAbout>(aboutPageQuery);
  return doc ?? fallbackAbout;
}

export async function getServicesPage() {
  const doc = await fetchSanity<{
    seo: { title: string; description: string };
    header: PageHeader;
    servicesSection: { eyebrow: string; title: string; description: string };
    partnersSection: { eyebrow: string; title: string; description: string };
  }>(servicesPageQuery);
  if (doc) {
    return {
      seo: doc.seo,
      header: doc.header,
      servicesSection: doc.servicesSection,
      partnersSection: doc.partnersSection,
    };
  }
  return {
    seo: fallbackServices.seo,
    header: fallbackServices.header,
    servicesSection: fallbackServices.servicesSection,
    partnersSection: fallbackServices.partnersSection,
  };
}

export async function getBranchesPage() {
  const doc = await fetchSanity<typeof fallbackBranches>(branchesPageQuery);
  if (doc) {
    return {
      seo: doc.seo,
      header: doc.header,
      section: doc.section,
    };
  }
  return {
    seo: fallbackBranches.seo,
    header: fallbackBranches.header,
    section: fallbackBranches.section,
  };
}

export async function getHowItWorksPage() {
  const home = await getHomePage();
  return home.howItWorksPage;
}

export async function getContactPage() {
  const doc = await fetchSanity<typeof fallbackContact>(contactPageQuery);
  return doc ?? fallbackContact;
}
