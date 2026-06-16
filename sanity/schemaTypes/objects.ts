import { defineField, defineType } from "sanity";

const iconOptions = [
  { title: "Shield Check", value: "ShieldCheck" },
  { title: "Lock", value: "Lock" },
  { title: "Users", value: "Users" },
  { title: "Award", value: "Award" },
  { title: "Zap", value: "Zap" },
  { title: "Map Pin", value: "MapPin" },
  { title: "Heart Handshake", value: "HeartHandshake" },
  { title: "User Check", value: "UserCheck" },
  { title: "Badge Percent", value: "BadgePercent" },
  { title: "Navigation", value: "Navigation" },
  { title: "Globe", value: "Globe" },
  { title: "Globe 2", value: "Globe2" },
  { title: "Send", value: "Send" },
  { title: "Banknote", value: "Banknote" },
  { title: "Smartphone", value: "Smartphone" },
  { title: "Wallet", value: "Wallet" },
  { title: "Building", value: "Building2" },
  { title: "Arrow Down", value: "ArrowDownToLine" },
  { title: "Arrow Left Right", value: "ArrowLeftRight" },
  { title: "Briefcase", value: "Briefcase" },
  { title: "Receipt", value: "Receipt" },
  { title: "Headphones", value: "Headphones" },
  { title: "Map Pinned", value: "MapPinned" },
  { title: "File Text", value: "FileText" },
  { title: "Credit Card", value: "CreditCard" },
  { title: "ID Card", value: "IdCard" },
  { title: "Hash", value: "Hash" },
];

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Page Title", type: "string" }),
    defineField({ name: "description", title: "Meta Description", type: "text", rows: 3 }),
  ],
});

export const pageHeader = defineType({
  name: "pageHeader",
  title: "Page Header",
  type: "object",
  fields: [
    defineField({ name: "badge", title: "Badge", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subtitle", title: "Subtitle", type: "text", rows: 3 }),
  ],
});

export const sectionIntro = defineType({
  name: "sectionIntro",
  title: "Section Intro",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
  ],
});

export const businessHours = defineType({
  name: "businessHours",
  title: "Business Hours",
  type: "object",
  fields: [
    defineField({ name: "weekdays", title: "Weekdays", type: "string" }),
    defineField({ name: "saturday", title: "Saturday", type: "string" }),
    defineField({ name: "sunday", title: "Sunday", type: "string" }),
    defineField({ name: "summary", title: "Summary (Footer)", type: "string" }),
  ],
});

export const socialLinks = defineType({
  name: "socialLinks",
  title: "Social Links",
  type: "object",
  fields: [
    defineField({ name: "facebook", title: "Facebook URL", type: "url" }),
    defineField({ name: "twitter", title: "Twitter URL", type: "url" }),
    defineField({ name: "instagram", title: "Instagram URL", type: "url" }),
  ],
});

export const footerContent = defineType({
  name: "footerContent",
  title: "Footer",
  type: "object",
  fields: [
    defineField({ name: "description", title: "Footer Description", type: "text", rows: 3 }),
    defineField({ name: "companyHeading", title: "Company Column Heading", type: "string" }),
    defineField({ name: "servicesHeading", title: "Services Column Heading", type: "string" }),
    defineField({ name: "contactHeading", title: "Contact Column Heading", type: "string" }),
  ],
});

export const trustBadge = defineType({
  name: "trustBadge",
  title: "Trust Badge",
  type: "object",
  fields: [
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: iconOptions } }),
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({ name: "highlight", title: "Highlight (optional)", type: "string" }),
    defineField({ name: "sub", title: "Subtext", type: "string" }),
    defineField({
      name: "accent",
      title: "Accent Color",
      type: "string",
      options: { list: ["blue", "purple", "red", "orange"] },
    }),
  ],
});

export const whyChooseItem = defineType({
  name: "whyChooseItem",
  title: "Why Choose Us Item",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: iconOptions } }),
  ],
});

export const stepItem = defineType({
  name: "stepItem",
  title: "Step",
  type: "object",
  fields: [
    defineField({ name: "number", title: "Step Number", type: "number" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: iconOptions } }),
  ],
});

export const serviceItem = defineType({
  name: "serviceItem",
  title: "Service",
  type: "object",
  fields: [
    defineField({ name: "id", title: "ID (unique)", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: iconOptions } }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});

export const partnerItem = defineType({
  name: "partnerItem",
  title: "Partner",
  type: "object",
  fields: [
    defineField({ name: "id", title: "ID", type: "string" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: iconOptions } }),
    defineField({ name: "color", title: "Icon Color Class", type: "string" }),
    defineField({ name: "bgColor", title: "Background Class", type: "string" }),
  ],
});

export const branchItem = defineType({
  name: "branchItem",
  title: "Branch",
  type: "object",
  fields: [
    defineField({ name: "id", title: "ID", type: "string" }),
    defineField({ name: "name", title: "Branch Name", type: "string" }),
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({ name: "address", title: "Address", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "hours", title: "Hours", type: "businessHours" }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "isMain", title: "Main Branch", type: "boolean" }),
  ],
});

export const agentItem = defineType({
  name: "agentItem",
  title: "Agent",
  type: "object",
  fields: [
    defineField({ name: "id", title: "ID", type: "string" }),
    defineField({ name: "name", title: "Agent Name", type: "string" }),
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "isActive", title: "Active", type: "boolean" }),
  ],
});
