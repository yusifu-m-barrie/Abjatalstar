import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(relativePath: string): T {
  const filePath = path.join(CONTENT_DIR, relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

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
}

export function getSiteSettings(): SiteSettings {
  return readJson<SiteSettings>("settings/site.json");
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

export function getServices() {
  return readJson<{ items: ServiceItem[] }>("shared/services.json").items;
}

export function getPartners() {
  return readJson<{ items: PartnerItem[] }>("shared/partners.json").items;
}

export function getBranches() {
  return readJson<{ items: BranchItem[] }>("shared/branches.json").items;
}

export function getWhyChooseUs() {
  return readJson<{ items: WhyChooseItem[] }>("shared/why-choose-us.json").items;
}

export function getHowItWorksSteps() {
  return readJson<{ sending: StepItem[]; receiving: StepItem[] }>("shared/how-it-works.json");
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
  };
  contact: { eyebrow: string; title: string; description: string };
}

export function getHomePage(): HomePageContent {
  return readJson<HomePageContent>("pages/home.json");
}

export function getAboutPage() {
  return readJson<{
    seo: { title: string; description: string };
    header: PageHeader;
    whoWeAre: { title: string; paragraphs: string[] };
    mission: { title: string; text: string };
    vision: { title: string; text: string };
    values: { title: string; description: string; items: { title: string; description: string }[] };
    showTrustBadges: boolean;
    showWhyChooseUs: boolean;
  }>("pages/about.json");
}

export function getServicesPage() {
  return readJson<{
    seo: { title: string; description: string };
    header: PageHeader;
    servicesSection: { eyebrow: string; title: string; description: string };
    partnersSection: { eyebrow: string; title: string; description: string };
  }>("pages/services.json");
}

export function getBranchesPage() {
  return readJson<{
    seo: { title: string; description: string };
    header: PageHeader;
    section: { eyebrow: string; title: string; description: string; bannerText: string };
  }>("pages/branches.json");
}

export function getHowItWorksPage() {
  return readJson<{
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
  }>("pages/how-it-works.json");
}

export function getContactPage() {
  return readJson<{
    seo: { title: string; description: string };
    header: PageHeader;
    section: {
      eyebrow: string;
      title: string;
      description: string;
      contactInfoTitle: string;
      formTitle: string;
      successTitle: string;
      successMessage: string;
      sendAnotherText: string;
      submitButton: string;
      fields: {
        fullName: { label: string; placeholder: string };
        phone: { label: string; placeholder: string };
        service: { label: string; placeholder: string };
        message: { label: string; placeholder: string };
      };
    };
    serviceOptions: string[];
  }>("pages/contact.json");
}
