import type { EmailAccount } from "@/lib/email-accounts/types";
import type { CreateEmailAccountResult, EmailProvider } from "./types";

export class ManualEmailProvider implements EmailProvider {
  name = "manual" as const;

  getSetupInstructions(email: string): string {
    return [
      `Create ${email} in HostGator cPanel → Email Accounts.`,
      "Set a secure mailbox password and share it with the staff member through your internal process.",
      "After the mailbox is live, mark the account as Active in this dashboard.",
    ].join(" ");
  }

  async createAccount(
    account: EmailAccount
  ): Promise<CreateEmailAccountResult> {
    return {
      success: true,
      account,
      requiresManualSetup: true,
      message: this.getSetupInstructions(account.email),
    };
  }
}

export const manualEmailProvider = new ManualEmailProvider();
