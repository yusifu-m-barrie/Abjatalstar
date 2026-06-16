import site from "../content/settings.json";

export const BUSINESS = {
  name: site.name,
  shortName: site.shortName,
  tagline: site.tagline,
  subtitle: site.subtitle,
  description: site.description,
  phone: site.phone,
  phoneDisplay: site.phoneDisplay,
  whatsapp: site.whatsapp,
  email: site.email,
  address: site.address,
  founded: site.founded,
  license: site.license,
  logo: site.logo,
} as const;

export const BUSINESS_HOURS = site.hours;

export const SOCIAL_LINKS = site.social;

export const FOOTER = site.footer;
