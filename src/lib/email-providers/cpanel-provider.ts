import type { EmailAccount } from "@/lib/email-accounts/types";
import type { CreateEmailAccountResult, EmailProvider } from "./types";

/**
 * Scaffold for future HostGator/cPanel API integration.
 * Do NOT call real cPanel endpoints until credentials and security review are in place.
 */
export class CpanelEmailProvider implements EmailProvider {
  name = "cpanel" as const;

  getSetupInstructions(email: string): string {
    return `cPanel API integration is not enabled yet. Create ${email} manually in HostGator cPanel → Email Accounts.`;
  }

  async createAccount(
    account: EmailAccount
  ): Promise<CreateEmailAccountResult> {
    const host = process.env.CPANEL_HOST;
    const user = process.env.CPANEL_USERNAME;
    const token = process.env.CPANEL_API_TOKEN;

    if (!host || !user || !token) {
      return {
        success: false,
        requiresManualSetup: true,
        message:
          "cPanel API credentials are not configured. Use manual HostGator setup for now.",
        account,
      };
    }

    // Future: secure server-side cPanel UAPI call would go here.
    return {
      success: false,
      requiresManualSetup: true,
      message:
        "cPanel automation is scaffolded but not implemented. Complete mailbox setup in HostGator cPanel.",
      account,
    };
  }
}

export const cpanelEmailProvider = new CpanelEmailProvider();
