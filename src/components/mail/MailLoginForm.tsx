"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Lock, Mail, Shield } from "lucide-react";
import { mailConfig } from "@/lib/mail-config";
import MailLogo from "./MailLogo";

function isValidStaffEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  return email.endsWith(`@${mailConfig.mailDomain}`);
}

export default function MailLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!isValidStaffEmail(trimmedEmail)) {
      setError(`Please use your @${mailConfig.mailDomain} staff email address.`);
      return;
    }

    setLoading(true);

    // Branded gateway — password is never stored, sent to API, or placed in the URL.
    await new Promise((resolve) => setTimeout(resolve, 900));

    const webmailUrl = new URL(mailConfig.webmailUrl);
    webmailUrl.searchParams.set("email", trimmedEmail.toLowerCase());

    setPassword("");
    window.location.href = webmailUrl.toString();
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-white p-8 card-shadow sm:p-10">
        <div className="mb-8">
          <MailLogo size="lg" />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-blue sm:text-3xl">
            {mailConfig.brandName} Mail
          </h1>
          <p className="mt-2 text-sm text-muted">Secure branded gateway to staff webmail</p>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted">
            This page is a secure AbjatalStar-branded entry point. You will be redirected to
            HostGator webmail to complete sign-in. This site does not store your mailbox password.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/5 px-3 py-1 text-xs font-medium text-brand-green">
            <Shield className="h-3.5 w-3.5" />
            Authorized staff only
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="mail-email"
              className="mb-1.5 block text-sm font-medium text-brand-blue"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="mail-email"
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`name@${mailConfig.mailDomain}`}
                className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="mail-password"
              className="mb-1.5 block text-sm font-medium text-brand-blue"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="mail-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your mailbox password"
                className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Use the email address and password provided by AbjatalStar Admin. Your
            password is not stored on this website.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-blue-light hover:shadow-lg hover:shadow-brand-blue/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting securely…
              </>
            ) : (
              "Sign in to Mail"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted">
            Forgot your password? Contact your AbjatalStar administrator or reset it
            in HostGator cPanel → Email Accounts.
          </p>
          <a
            href={mailConfig.webmailDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:underline"
          >
            Open Webmail Directly
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-xs text-muted hover:text-brand-blue">
            ← Back to abjatalstar.com
          </Link>
        </p>
      </div>
    </div>
  );
}
