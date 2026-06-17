import { mailConfig } from "@/lib/mail-config";

const LOCAL_PART_RE = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

export function normalizeEmailLocalPart(value: string): string {
  return value.trim().toLowerCase().replace(/@.*$/, "");
}

export function buildStaffEmail(localPart: string): string {
  const normalized = normalizeEmailLocalPart(localPart);
  if (!LOCAL_PART_RE.test(normalized)) {
    throw new Error(
      "Email username may only contain letters, numbers, dots, hyphens, and underscores."
    );
  }
  return `${normalized}@${mailConfig.mailDomain}`;
}

export function parseEmailLocalPart(email: string): string {
  const at = email.indexOf("@");
  if (at === -1) return normalizeEmailLocalPart(email);
  return email.slice(0, at).toLowerCase();
}

export function isValidMailboxPassword(password: string): boolean {
  return password.length >= 8;
}
