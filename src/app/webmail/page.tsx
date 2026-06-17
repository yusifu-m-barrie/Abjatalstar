import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWebmailDestinationUrl } from "@/lib/mail-config";

export const metadata: Metadata = {
  title: "Redirecting to Webmail",
  robots: { index: false, follow: false },
};

type WebmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function WebmailRedirectPage({
  searchParams,
}: WebmailPageProps) {
  const { email } = await searchParams;
  redirect(getWebmailDestinationUrl(email));
}
