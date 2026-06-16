import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../../../sanity/env";
import type {
  EmailAccount,
  EmailAccountInput,
  EmailAccountUpdate,
} from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "email-accounts.json");

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

function mapSanityDoc(doc: Record<string, unknown>): EmailAccount {
  return {
    id: doc._id as string,
    fullName: (doc.fullName as string) ?? "",
    email: (doc.email as string) ?? "",
    role: (doc.role as string) ?? "",
    department: (doc.department as string) ?? "",
    status: (doc.status as EmailAccount["status"]) ?? "inactive",
    createdAt: (doc.createdAt as string) ?? new Date().toISOString(),
    notes: (doc.notes as string) ?? "",
  };
}

async function readJsonStore(): Promise<EmailAccount[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as EmailAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonStore(accounts: EmailAccount[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(accounts, null, 2), "utf8");
}

export async function listEmailAccounts(): Promise<EmailAccount[]> {
  if (useSanityStore()) {
    const docs = await sanityWriteClient.fetch<
      Record<string, unknown>[]
    >(`*[_type == "staffEmailAccount"] | order(createdAt desc)`);
    return docs.map(mapSanityDoc);
  }
  return readJsonStore();
}

export async function getEmailAccount(id: string): Promise<EmailAccount | null> {
  const accounts = await listEmailAccounts();
  return accounts.find((a) => a.id === id) ?? null;
}

export async function createEmailAccountRecord(
  input: EmailAccountInput
): Promise<EmailAccount> {
  const createdAt = new Date().toISOString();

  if (useSanityStore()) {
    const doc = await sanityWriteClient.create({
      _type: "staffEmailAccount",
      ...input,
      createdAt,
    });
    return mapSanityDoc(doc as Record<string, unknown>);
  }

  const account: EmailAccount = {
    id: crypto.randomUUID(),
    createdAt,
    ...input,
  };
  const accounts = await readJsonStore();
  accounts.unshift(account);
  await writeJsonStore(accounts);
  return account;
}

export async function updateEmailAccountRecord(
  id: string,
  update: EmailAccountUpdate
): Promise<EmailAccount | null> {
  if (useSanityStore()) {
    const doc = await sanityWriteClient
      .patch(id)
      .set(update)
      .commit({ autoGenerateArrayKeys: true });
    return mapSanityDoc(doc as Record<string, unknown>);
  }

  const accounts = await readJsonStore();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return null;

  accounts[index] = { ...accounts[index], ...update };
  await writeJsonStore(accounts);
  return accounts[index];
}

export async function deleteEmailAccountRecord(id: string): Promise<boolean> {
  if (useSanityStore()) {
    await sanityWriteClient.delete(id);
    return true;
  }

  const accounts = await readJsonStore();
  const next = accounts.filter((a) => a.id !== id);
  if (next.length === accounts.length) return false;
  await writeJsonStore(next);
  return true;
}
