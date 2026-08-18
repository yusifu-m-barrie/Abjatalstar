import type { CurrentUser } from "sanity";

export const WEBSITE_DOC_TYPES = [
  "siteSettings",
  "homePage",
  "servicesPage",
  "branchesPage",
  "agentsPage",
  "aboutPage",
  "contactPage",
] as const;

export type WebsiteDocType = (typeof WEBSITE_DOC_TYPES)[number];

export const WEBSITE_DOC_TYPE_SET = new Set<string>(WEBSITE_DOC_TYPES);

const ADMIN_ROLE_NAMES = new Set([
  "administrator",
  "admin",
  "mainAdmin",
]);

const EDITOR_ROLE_NAMES = new Set([
  "editor",
  "staffEditor",
  "contributor",
]);

export function getRoleNames(user: CurrentUser | null | undefined): string[] {
  return (user?.roles ?? []).map((role) => role.name);
}

export function isSanityAdmin(user: CurrentUser | null | undefined): boolean {
  return getRoleNames(user).some((name) => ADMIN_ROLE_NAMES.has(name));
}

export function isStaffEditor(user: CurrentUser | null | undefined): boolean {
  if (isSanityAdmin(user)) return false;
  return getRoleNames(user).some((name) => EDITOR_ROLE_NAMES.has(name));
}

export const EDITOR_INVITE_ROLE = "editor";
