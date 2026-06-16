export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  name,
  shortName,
  tagline,
  subtitle,
  description,
  phone,
  phoneDisplay,
  whatsapp,
  email,
  address,
  founded,
  license,
  logo,
  hours,
  social,
  footer,
  seo
}`;

export const homePageQuery = `*[_type == "homePage"][0]`;

export const servicesPageQuery = `*[_type == "servicesPage"][0]`;

export const branchesPageQuery = `*[_type == "branchesPage"][0]`;

export const agentsPageQuery = `*[_type == "agentsPage"][0]`;

export const aboutPageQuery = `*[_type == "aboutPage"][0]`;

export const contactPageQuery = `*[_type == "contactPage"][0]`;
