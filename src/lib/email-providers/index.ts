import { mailConfig } from "@/lib/mail-config";
import { cpanelEmailProvider } from "./cpanel-provider";
import { manualEmailProvider } from "./manual-provider";
import type { EmailProvider } from "./types";

export function getEmailProvider(): EmailProvider {
  if (mailConfig.emailProvider === "cpanel") {
    return cpanelEmailProvider;
  }
  return manualEmailProvider;
}

export type { CreateEmailAccountResult, EmailProvider, EmailProviderName } from "./types";
