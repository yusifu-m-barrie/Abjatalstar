export const mailConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? "AbjatalStar",
  mailDomain: process.env.NEXT_PUBLIC_MAIL_DOMAIN ?? "abjatalstar.com",
  /** Branded staff entry URL — `/mail` redirects to HostGator webmail */
  webmailUrl:
    process.env.NEXT_PUBLIC_WEBMAIL_URL ?? "https://abjatalstar.com/mail",
  /** Direct HostGator webmail link (public fallback) */
  webmailDirectUrl:
    process.env.NEXT_PUBLIC_WEBMAIL_DIRECT_URL ??
    "https://mail.abjatalstar.com:2096",
  /** Mail admin dashboard login (staff mailbox registry) */
  mailAdminLoginUrl: "/admin/email-accounts/login",
  /** Sanity CMS studio */
  sanityAdminUrl: "/admin",
  emailProvider: (process.env.EMAIL_PROVIDER ?? "manual") as "manual" | "cpanel",
  logoPath: process.env.NEXT_PUBLIC_BRAND_LOGO_PATH ?? "/abjatal-star-logo.png",
  fallbackLogoPath: process.env.NEXT_PUBLIC_BRAND_FALLBACK_LOGO_PATH,
};

/** Actual HostGator/cPanel webmail (server-only). Set in Vercel from cPanel → Email → Access Webmail. */
export function getWebmailDestinationUrl(email?: string): string {
  const destination =
    process.env.WEBMAIL_DESTINATION_URL ?? "https://mail.abjatalstar.com:2096";
  const url = new URL(destination);
  if (email) {
    url.searchParams.set("email", email);
  }
  return url.toString();
}
