import type { EmailAccountInput } from "@/lib/email-accounts/types";
import type {
  CreateEmailAccountResult,
  EmailProvider,
  ProvisionMailboxOptions,
} from "./types";
import {
  cpanelAddMailbox,
  cpanelDeleteMailbox,
  cpanelUpdateMailboxPassword,
  isCpanelConfigured,
} from "./cpanel-client";
import { mailConfig } from "@/lib/mail-config";
import { parseEmailLocalPart } from "@/lib/mail-email";

export class CpanelEmailProvider implements EmailProvider {
  name = "cpanel" as const;

  getSetupInstructions(email: string): string {
    return `Mailbox ${email} is created automatically in HostGator cPanel.`;
  }

  async createAccount(
    input: EmailAccountInput,
    options: ProvisionMailboxOptions
  ): Promise<CreateEmailAccountResult> {
    if (!isCpanelConfigured()) {
      return {
        success: false,
        requiresManualSetup: true,
        message:
          "HostGator cPanel API is not configured. Add CPANEL_HOST, CPANEL_USERNAME, and CPANEL_API_TOKEN on Vercel.",
      };
    }

    if (!options.password) {
      return {
        success: false,
        message: "A mailbox password is required to create the HostGator email account.",
      };
    }

    const localPart = parseEmailLocalPart(input.email);

    try {
      await cpanelAddMailbox(
        localPart,
        options.password,
        mailConfig.mailDomain
      );

      return {
        success: true,
        message: `${input.email} was created in HostGator. Share the password with the staff member for login at /mail.`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create mailbox in HostGator cPanel.",
      };
    }
  }

  async updatePassword(
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    if (!isCpanelConfigured()) {
      return {
        success: false,
        message: "cPanel API is not configured on the server.",
      };
    }

    try {
      await cpanelUpdateMailboxPassword(
        parseEmailLocalPart(email),
        password,
        mailConfig.mailDomain
      );
      return {
        success: true,
        message: `Password updated for ${email} in HostGator.`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update mailbox password in HostGator.",
      };
    }
  }

  async deleteMailbox(email: string): Promise<{ success: boolean; message: string }> {
    if (!isCpanelConfigured()) {
      return { success: false, message: "cPanel API is not configured on the server." };
    }

    try {
      await cpanelDeleteMailbox(parseEmailLocalPart(email), mailConfig.mailDomain);
      return { success: true, message: `${email} removed from HostGator cPanel.` };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete mailbox from HostGator.",
      };
    }
  }
}

export const cpanelEmailProvider = new CpanelEmailProvider();
