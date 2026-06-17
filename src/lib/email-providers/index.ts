import { mailConfig } from "@/lib/mail-config";
import { isCpanelConfigured } from "./cpanel-client";
import { cpanelEmailProvider } from "./cpanel-provider";
import { manualEmailProvider } from "./manual-provider";
import type { EmailProvider } from "./types";

export function getEmailProvider(): EmailProvider {
  if (mailConfig.emailProvider === "cpanel" || isCpanelConfigured()) {
    return cpanelEmailProvider;
  }
  return manualEmailProvider;
}

export function getCpanelEmailProvider() {
  return cpanelEmailProvider;
}

export type {
  CreateEmailAccountResult,
  EmailProvider,
  EmailProviderName,
  ProvisionMailboxOptions,
} from "./types";
