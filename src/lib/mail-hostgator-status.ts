import { mailConfig } from "@/lib/mail-config";
import { isCpanelConfigured } from "@/lib/email-providers/cpanel-client";

/** Public-safe HostGator status — never exposes credentials or tokens. */
export function getHostgatorPublicStatus() {
  return {
    hostgatorConnected: isCpanelConfigured(),
    emailProvider: mailConfig.emailProvider,
  };
}

/** Super Admin only — still never exposes username, token, or passwords. */
export function getCpanelSettingsForSuperAdmin() {
  const configured = isCpanelConfigured();
  const host = process.env.CPANEL_HOST?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return {
    ...getHostgatorPublicStatus(),
    cpanelHostConfigured: Boolean(host),
    cpanelHost: host ?? null,
    cpanelUsernameConfigured: Boolean(process.env.CPANEL_USERNAME),
    cpanelTokenConfigured: Boolean(process.env.CPANEL_API_TOKEN),
    webmailDestinationConfigured: Boolean(process.env.WEBMAIL_DESTINATION_URL),
    note: configured
      ? "HostGator API is connected. Credentials are stored server-side only in environment variables."
      : "HostGator API is not connected. Add CPANEL_HOST, CPANEL_USERNAME, and CPANEL_API_TOKEN on the server (Vercel/local .env).",
  };
}

export function getHostgatorApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    if (message.toLowerCase().includes("could not reach hostgator")) {
      return "Could not reach HostGator. The staff record was saved, but mailbox provisioning failed. Try again later or create the mailbox manually in cPanel.";
    }
    return message;
  }
  return "HostGator API request failed. Please try again or create the mailbox manually in cPanel.";
}
