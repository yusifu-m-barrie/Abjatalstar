import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MailAdminLoginForm from "@/components/mail/MailAdminLoginForm";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Email Admin Login",
  robots: { index: false, follow: false },
};

export default async function EmailAccountsLoginPage() {
  if (await isMailAdminAuthenticated()) {
    redirect("/admin/email-accounts");
  }

  const { logo } = await getSiteSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-section-alt px-4 py-12">
      <MailAdminLoginForm logoSrc={logo} />
    </div>
  );
}
