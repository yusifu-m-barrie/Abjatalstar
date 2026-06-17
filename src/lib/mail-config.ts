const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.abjatalstar.com";

export const mailConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? "AbjatalStar",
  mailDomain: process.env.NEXT_PUBLIC_MAIL_DOMAIN ?? "abjatalstar.com",
  /** Branded on-site gateway — /mail sends users here first */
  webmailUrl:
    process.env.NEXT_PUBLIC_WEBMAIL_URL ?? `${siteUrl.replace(/\/$/, "")}/webmail`,
  emailProvider: (process.env.EMAIL_PROVIDER ?? "manual") as "manual" | "cpanel",
  logoPath: "/logo.png",
  fallbackLogoPath: "/abjatal-star-logo.png",
};

/** Actual HostGator/cPanel webmail (server-only). Set in Vercel from cPanel → Email → Access Webmail. */
export function getWebmailDestinationUrl(email?: string): string {
  const destination =
    process.env.WEBMAIL_DESTINATION_URL ?? "https://webmail.abjatalstar.com";
  const url = new URL(destination);
  if (email) {
    url.searchParams.set("email", email);
  }
  return url.toString();
}
