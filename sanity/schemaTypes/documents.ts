import { CogIcon, HomeIcon, DocumentsIcon, PinIcon, UsersIcon, InfoOutlineIcon, EnvelopeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({ name: "name", title: "Business Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "shortName", title: "Short Name", type: "string" }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "phone", title: "Phone Number", type: "string" }),
    defineField({ name: "phoneDisplay", title: "Phone Display", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp Number", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "address", title: "Address", type: "string" }),
    defineField({ name: "founded", title: "Year Founded", type: "string" }),
    defineField({ name: "license", title: "License Text", type: "string" }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "hours", title: "Business Hours", type: "businessHours" }),
    defineField({ name: "social", title: "Social Media", type: "socialLinks" }),
    defineField({ name: "footer", title: "Footer", type: "footerContent" }),
    defineField({ name: "seo", title: "Default SEO", type: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});

export const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({ name: "badge", title: "Badge", type: "string" }),
        defineField({ name: "title", title: "Title (Part 1)", type: "string" }),
        defineField({ name: "titleHighlight", title: "Title Highlight", type: "string" }),
        defineField({ name: "titleSuffix", title: "Title (Part 2)", type: "string" }),
        defineField({ name: "primaryButton", title: "Primary Button", type: "string" }),
        defineField({ name: "secondaryButton", title: "Secondary Button", type: "string" }),
        defineField({ name: "trustLabel", title: "Trust Badges Label", type: "string" }),
        defineField({
          name: "statsCard",
          title: "Stats Card",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({
              name: "transactions",
              title: "Transactions",
              type: "array",
              of: [{
                type: "object",
                fields: [
                  defineField({ name: "label", type: "string", title: "Label" }),
                  defineField({ name: "amount", type: "string", title: "Amount" }),
                  defineField({ name: "status", type: "string", title: "Status" }),
                ],
              }],
            }),
            defineField({ name: "securityTitle", title: "Security Title", type: "string" }),
            defineField({ name: "securityText", title: "Security Text", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({
      name: "trustBadges",
      title: "Trust Badges",
      type: "array",
      of: [{ type: "trustBadge" }],
    }),
    defineField({ name: "partners", title: "Partners Section", type: "sectionIntro" }),
    defineField({
      name: "services",
      title: "Services Section",
      type: "object",
      fields: [
        ...sectionFields(),
        defineField({ name: "limit", title: "Number to Show", type: "number" }),
        defineField({ name: "showViewAll", title: "Show View All", type: "boolean" }),
        defineField({ name: "viewAllText", title: "View All Text", type: "string" }),
      ],
    }),
    defineField({
      name: "whyChooseUs",
      title: "Why Choose Us",
      type: "object",
      fields: [
        ...sectionFields(),
        defineField({
          name: "stats",
          title: "Stats",
          type: "object",
          fields: [
            defineField({ name: "customers", type: "string", title: "Customers" }),
            defineField({ name: "customersLabel", type: "string", title: "Customers Label" }),
            defineField({ name: "branches", type: "string", title: "Branches" }),
            defineField({ name: "branchesLabel", type: "string", title: "Branches Label" }),
            defineField({ name: "partners", type: "string", title: "Partners" }),
            defineField({ name: "partnersLabel", type: "string", title: "Partners Label" }),
            defineField({ name: "years", type: "string", title: "Years" }),
            defineField({ name: "yearsLabel", type: "string", title: "Years Label" }),
          ],
        }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          of: [{ type: "whyChooseItem" }],
        }),
      ],
    }),
    defineField({
      name: "branches",
      title: "Branches Section",
      type: "object",
      fields: [
        ...sectionFields(),
        defineField({ name: "limit", title: "Number to Show", type: "number" }),
        defineField({ name: "showViewAll", title: "Show View All", type: "boolean" }),
        defineField({ name: "viewAllText", title: "View All Text", type: "string" }),
        defineField({ name: "bannerText", title: "Banner Text", type: "string" }),
      ],
    }),
    defineField({
      name: "howItWorks",
      title: "How It Works (Homepage)",
      type: "object",
      fields: [
        ...sectionFields(),
        defineField({ name: "compact", title: "Compact Mode", type: "boolean" }),
        defineField({ name: "linkText", title: "Link Text", type: "string" }),
        defineField({
          name: "steps",
          title: "Steps",
          type: "object",
          fields: [
            defineField({ name: "sending", title: "Sending Steps", type: "array", of: [{ type: "stepItem" }] }),
            defineField({ name: "receiving", title: "Receiving Steps", type: "array", of: [{ type: "stepItem" }] }),
          ],
        }),
      ],
    }),
    defineField({ name: "contact", title: "Contact Section (Homepage)", type: "sectionIntro" }),
    defineField({
      name: "howItWorksPage",
      title: "How It Works Page",
      type: "object",
      fields: [
        defineField({ name: "seo", title: "SEO", type: "seo" }),
        defineField({ name: "header", title: "Header", type: "pageHeader" }),
        defineField({
          name: "section",
          title: "Section",
          type: "object",
          fields: [
            ...sectionFields(),
            defineField({ name: "sendingTitle", title: "Sending Title", type: "string" }),
            defineField({ name: "receivingTitle", title: "Receiving Title", type: "string" }),
          ],
        }),
        defineField({
          name: "cta",
          title: "Call to Action",
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", title: "Title" }),
            defineField({ name: "description", type: "text", title: "Description", rows: 3 }),
            defineField({ name: "primaryButton", type: "string", title: "Primary Button" }),
            defineField({ name: "secondaryButton", type: "string", title: "Secondary Button" }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});

function sectionFields() {
  return [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
  ];
}

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "header", title: "Page Header", type: "pageHeader" }),
    defineField({ name: "servicesSection", title: "Services Section", type: "sectionIntro" }),
    defineField({ name: "partnersSection", title: "Partners Section", type: "sectionIntro" }),
    defineField({ name: "items", title: "Service List", type: "array", of: [{ type: "serviceItem" }] }),
    defineField({ name: "partners", title: "Partners", type: "array", of: [{ type: "partnerItem" }] }),
  ],
  preview: { prepare: () => ({ title: "Services" }) },
});

export const branchesPage = defineType({
  name: "branchesPage",
  title: "Branches",
  type: "document",
  icon: PinIcon,
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "header", title: "Page Header", type: "pageHeader" }),
    defineField({
      name: "section",
      title: "Section",
      type: "object",
      fields: [
        ...sectionFields(),
        defineField({ name: "bannerText", title: "Banner Text", type: "string" }),
      ],
    }),
    defineField({ name: "items", title: "Branch Locations", type: "array", of: [{ type: "branchItem" }] }),
  ],
  preview: { prepare: () => ({ title: "Branches" }) },
});

export const agentsPage = defineType({
  name: "agentsPage",
  title: "Agents",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({ name: "header", title: "Page Header", type: "pageHeader" }),
    defineField({ name: "items", title: "Agents", type: "array", of: [{ type: "agentItem" }] }),
  ],
  preview: { prepare: () => ({ title: "Agents" }) },
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About",
  type: "document",
  icon: InfoOutlineIcon,
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "header", title: "Page Header", type: "pageHeader" }),
    defineField({
      name: "whoWeAre",
      title: "Who We Are",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "array",
          of: [{ type: "text" }],
        }),
      ],
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", title: "Title" }),
        defineField({ name: "text", type: "text", title: "Text", rows: 4 }),
      ],
    }),
    defineField({
      name: "vision",
      title: "Vision",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", title: "Title" }),
        defineField({ name: "text", type: "text", title: "Text", rows: 4 }),
      ],
    }),
    defineField({
      name: "values",
      title: "Values",
      type: "object",
      fields: [
        defineField({ name: "title", type: "string", title: "Title" }),
        defineField({ name: "description", type: "text", title: "Description", rows: 3 }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          of: [{
            type: "object",
            fields: [
              defineField({ name: "title", type: "string", title: "Title" }),
              defineField({ name: "description", type: "text", title: "Description", rows: 3 }),
            ],
          }],
        }),
      ],
    }),
    defineField({ name: "showTrustBadges", title: "Show Trust Badges", type: "boolean" }),
    defineField({ name: "showWhyChooseUs", title: "Show Why Choose Us", type: "boolean" }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "header", title: "Page Header", type: "pageHeader" }),
    defineField({
      name: "section",
      title: "Contact Section",
      type: "object",
      fields: [
        ...sectionFields(),
        defineField({ name: "contactInfoTitle", title: "Contact Info Title", type: "string" }),
        defineField({ name: "formTitle", title: "Form Title", type: "string" }),
        defineField({ name: "successTitle", title: "Success Title", type: "string" }),
        defineField({ name: "successMessage", title: "Success Message", type: "text", rows: 3 }),
        defineField({ name: "sendAnotherText", title: "Send Another Text", type: "string" }),
        defineField({ name: "submitButton", title: "Submit Button", type: "string" }),
        defineField({
          name: "fields",
          title: "Form Fields",
          type: "object",
          fields: [
            fieldPair("fullName", "Full Name"),
            fieldPair("phone", "Phone"),
            fieldPair("service", "Service"),
            fieldPair("message", "Message"),
          ],
        }),
      ],
    }),
    defineField({
      name: "serviceOptions",
      title: "Service Options",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});

function fieldPair(name: string, label: string) {
  return defineField({
    name,
    title: label,
    type: "object",
    fields: [
      defineField({ name: "label", title: "Label", type: "string" }),
      defineField({ name: "placeholder", title: "Placeholder", type: "string" }),
    ],
  });
}
