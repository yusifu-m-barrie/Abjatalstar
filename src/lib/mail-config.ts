export const mailConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? "AbjatalStar",
  mailDomain: process.env.NEXT_PUBLIC_MAIL_DOMAIN ?? "abjatalstar.com",
  /** Branded gateway URL — staff go here first, then /webmail forwards to HostGator */
  webmailUrl:
    process.env.NEXT_PUBLIC_WEBMAIL_URL ?? "https://abjatalstar.com/webmail",
  /** Optional direct HostGator link for the fallback button (public) */
  webmailDirectUrl:
    process.env.NEXT_PUBLIC_WEBMAIL_DIRECT_URL ??
    process.env.NEXT_PUBLIC_WEBMAIL_URL ??
    "https://abjatalstar.com/webmail",
  emailProvider: (process.env.EMAIL_PROVIDER ?? "manual") as "manual" | "cpanel",
  logoPath: process.env.NEXT_PUBLIC_BRAND_LOGO_PATH,
  fallbackLogoPath: process.env.NEXT_PUBLIC_BRAND_FALLBACK_LOGO_PATH,
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
