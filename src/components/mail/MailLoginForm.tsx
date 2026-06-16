"use client";

import { FormEvent, useState } from "react";
import { ExternalLink, Loader2, Lock, Mail } from "lucide-react";
import { mailConfig } from "@/lib/mail-config";
import MailLogo from "./MailLogo";

export default function MailLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email address and password.");
      return;
    }

    setLoading(true);

    // Branded gateway — credentials are entered on HostGator webmail, not stored here.
    await new Promise((resolve) => setTimeout(resolve, 900));

    const webmailUrl = new URL(mailConfig.webmailUrl);
    webmailUrl.searchParams.set("email", email.trim());

    window.location.href = webmailUrl.toString();
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-white p-8 card-shadow sm:p-10">
        <div className="mb-8">
          <MailLogo size="lg" />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-blue">{mailConfig.brandName} Mail</h1>
          <p className="mt-2 text-sm text-muted">Secure staff email access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="mail-email" className="mb-1.5 block text-sm font-medium text-brand-blue">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="mail-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`name@${mailConfig.mailDomain}`}
                className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mail-password" className="mb-1.5 block text-sm font-medium text-brand-blue">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="mail-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your mailbox password"
                className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Use the email address and password provided by {mailConfig.brandName} Admin.
            Your password is not stored on this website.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-blue-light disabled:cursor-not-allowed disabled:opacity-70"
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
            Forgot your password? Contact your {mailConfig.brandName} administrator or use
            HostGator webmail password recovery.
          </p>
          <a
            href={mailConfig.webmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:underline"
          >
            Open Webmail Directly
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
