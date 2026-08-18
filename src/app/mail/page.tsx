import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWebmailDestinationUrl } from "@/lib/mail-config";
import { mailConfig } from "@/lib/mail-config";

export const metadata: Metadata = {
  title: `${mailConfig.brandName} Mail`,
  description: `Secure staff email access for ${mailConfig.brandName}.`,
  robots: { index: false, follow: false },
};

type MailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

/** Branded staff URL — redirects straight to HostGator webmail (single sign-in). */
export default async function MailPage({ searchParams }: MailPageProps) {
  const { email } = await searchParams;
  redirect(getWebmailDestinationUrl(email));
}
