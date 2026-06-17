import type { EmailAccount } from "@/lib/email-accounts/types";
import type { CreateEmailAccountResult, EmailProvider } from "./types";

export class ManualEmailProvider implements EmailProvider {
  name = "manual" as const;

  getSetupInstructions(email: string): string {
    return `Create this email inside HostGator cPanel → Email Accounts. (${email})`;
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
