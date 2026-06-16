import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EmailAccountsDashboard from "@/components/mail/EmailAccountsDashboard";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";
import { mailConfig } from "@/lib/mail-config";

export const metadata: Metadata = {
  title: `Email Accounts | ${mailConfig.brandName}`,
  robots: { index: false, follow: false },
};

export default async function EmailAccountsAdminPage() {
  if (!(await isMailAdminAuthenticated())) {
    redirect("/admin/email-accounts/login");
  }

  return <EmailAccountsDashboard />;
}
