import type { EmailAccountInput } from "@/lib/email-accounts/types";
import type {
  CreateEmailAccountResult,
  EmailProvider,
  ProvisionMailboxOptions,
} from "./types";
import { isCpanelConfigured } from "./cpanel-client";

export class ManualEmailProvider implements EmailProvider {
  name = "manual" as const;

  getSetupInstructions(email: string): string {
    return `Create this email inside HostGator cPanel → Email Accounts. (${email})`;
  }

  async createAccount(
    input: EmailAccountInput,
    options: ProvisionMailboxOptions
  ): Promise<CreateEmailAccountResult> {
    if (!options.password) {
      return {
        success: false,
        message: "Mailbox password is required.",
      };
    }

    if (!isCpanelConfigured()) {
      return {
        success: false,
        requiresManualSetup: true,
        message:
          "HostGator cPanel API is not configured. Add CPANEL_HOST, CPANEL_USERNAME, and CPANEL_API_TOKEN.",
      };
    }

    return {
      success: false,
      message:
        "Set EMAIL_PROVIDER=cpanel on Vercel to create HostGator mailboxes automatically.",
    };
  }
}

export const manualEmailProvider = new ManualEmailProvider();
