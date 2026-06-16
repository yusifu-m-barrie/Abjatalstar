import type { EmailAccount, EmailAccountInput } from "@/lib/email-accounts/types";

export type EmailProviderName = "manual" | "cpanel";

export interface CreateEmailAccountResult {
  success: boolean;
  message: string;
  account?: EmailAccount;
  requiresManualSetup?: boolean;
}

export interface EmailProvider {
  name: EmailProviderName;
  createAccount(input: EmailAccountInput): Promise<CreateEmailAccountResult>;
  getSetupInstructions(email: string): string;
}
