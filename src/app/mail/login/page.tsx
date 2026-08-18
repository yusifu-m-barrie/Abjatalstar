import { redirect } from "next/navigation";
import { getWebmailDestinationUrl } from "@/lib/mail-config";

type MailLoginPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function MailLoginRedirect({ searchParams }: MailLoginPageProps) {
  const { email } = await searchParams;
  redirect(getWebmailDestinationUrl(email));
}
