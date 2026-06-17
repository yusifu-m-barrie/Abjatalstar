import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../../../sanity/env";
import type { MailAdminRole } from "@/lib/mail-admin-roles";

export type EmailActivityAction =
  | "created"
  | "updated"
  | "activated"
  | "deactivated"
  | "deleted";

export interface EmailActivityLogEntry {
  id: string;
  action: EmailActivityAction;
  accountId: string;
  accountEmail: string;
  accountName: string;
  performedBy: string;
  performedByRole: MailAdminRole;
  timestamp: string;
  details?: string;
}

export interface LogEmailActivityInput {
  action: EmailActivityAction;
  accountId: string;
  accountEmail: string;
  accountName: string;
  performedBy: string;
  performedByRole: MailAdminRole;
  details?: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "email-activity-log.json");

const sanityWriteClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function useSanityStore(): boolean {
  return Boolean(projectId && process.env.SANITY_API_TOKEN);
}

function mapSanityDoc(doc: Record<string, unknown>): EmailActivityLogEntry {
  return {
    id: doc._id as string,
    action: doc.action as EmailActivityAction,
    accountId: (doc.accountId as string) ?? "",
    accountEmail: (doc.accountEmail as string) ?? "",
    accountName: (doc.accountName as string) ?? "",
    performedBy: (doc.performedBy as string) ?? "",
    performedByRole: doc.performedByRole as MailAdminRole,
    timestamp: (doc.timestamp as string) ?? new Date().toISOString(),
    details: (doc.details as string) ?? undefined,
  };
}

async function readJsonLog(): Promise<EmailActivityLogEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as EmailActivityLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonLog(entries: EmailActivityLogEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");
}

export async function logEmailActivity(
  input: LogEmailActivityInput
): Promise<EmailActivityLogEntry> {
  const timestamp = new Date().toISOString();

  if (useSanityStore()) {
    const doc = await sanityWriteClient.create({
      _type: "staffEmailActivityLog",
      ...input,
      timestamp,
    });
    return mapSanityDoc(doc as Record<string, unknown>);
  }

  const entry: EmailActivityLogEntry = {
    id: crypto.randomUUID(),
    timestamp,
    ...input,
  };
  const entries = await readJsonLog();
  entries.unshift(entry);
  await writeJsonLog(entries.slice(0, 500));
  return entry;
}

export async function listEmailActivityLogs(
  limit = 100
): Promise<EmailActivityLogEntry[]> {
  if (useSanityStore()) {
    const docs = await sanityWriteClient.fetch<Record<string, unknown>[]>(
      `*[_type == "staffEmailActivityLog"] | order(timestamp desc)[0...$limit]`,
      { limit }
    );
    return docs.map(mapSanityDoc);
  }

  const entries = await readJsonLog();
  return entries.slice(0, limit);
}
