import type { Metadata } from "next";
import Link from "next/link";
import MailLoginForm from "@/components/mail/MailLoginForm";
import { mailConfig } from "@/lib/mail-config";

export const metadata: Metadata = {
  title: `${mailConfig.brandName} Mail`,
  description: `Secure staff email access for ${mailConfig.brandName}.`,
  robots: { index: false, follow: false },
};

export default function MailPage() {
  return (
    <div className="min-h-screen hero-gradient">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-purple/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-green/5 blur-3xl" />

      <header className="relative z-10 px-4 pt-6 sm:px-6">
        <div className="container-custom flex justify-end">
          <Link
            href="/"
            className="text-sm font-medium text-brand-blue hover:text-brand-green"
          >
            Main website
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <MailLoginForm />
        <p className="mt-8 max-w-md text-center text-xs text-muted">
          © {new Date().getFullYear()} {mailConfig.brandName}. Secure branded gateway to staff
          webmail on HostGator. This portal does not change DNS or mailbox settings.
        </p>
      </div>
    </div>
  );
}
