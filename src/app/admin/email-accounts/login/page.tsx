import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MailAdminLoginForm from "@/components/mail/MailAdminLoginForm";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";

export const metadata: Metadata = {
  title: "Email Admin Login",
  robots: { index: false, follow: false },
};

export default async function EmailAccountsLoginPage() {
  if (await isMailAdminAuthenticated()) {
    redirect("/admin/email-accounts");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-section-alt px-4 py-12">
      <MailAdminLoginForm />
    </div>
  );
}
