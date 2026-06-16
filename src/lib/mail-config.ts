export const mailConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? "AbjatalStar",
  mailDomain: process.env.NEXT_PUBLIC_MAIL_DOMAIN ?? "abjatalstar.com",
  webmailUrl:
    process.env.NEXT_PUBLIC_WEBMAIL_URL ?? "https://abjatalstar.com/webmail",
  emailProvider: (process.env.EMAIL_PROVIDER ?? "manual") as "manual" | "cpanel",
  logoPath: "/logo.png",
  fallbackLogoPath: "/abjatal-star-logo.png",
};

export function resolveMailLogo(): { src: string; useText: boolean } {
  // Checked at runtime in client component via image onError
  return { src: mailConfig.logoPath, useText: false };
}
