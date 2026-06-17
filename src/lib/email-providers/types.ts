import type { EmailAccount, EmailAccountInput } from "@/lib/email-accounts/types";

export type EmailProviderName = "manual" | "cpanel";

export interface ProvisionMailboxOptions {
  password?: string;
}

export interface CreateEmailAccountResult {
  success: boolean;
  message: string;
  account?: EmailAccount;
  requiresManualSetup?: boolean;
}

export interface EmailProvider {
  name: EmailProviderName;
  createAccount(
    input: EmailAccountInput,
    options: ProvisionMailboxOptions
  ): Promise<CreateEmailAccountResult>;
  getSetupInstructions(email: string): string;
}
