"use client";

import { FormEvent, useState } from "react";
import { Loader2, Lock, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import MailLogo from "@/components/mail/MailLogo";
import { mailConfig } from "@/lib/mail-config";

export default function MailAdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/mail/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push("/admin/email-accounts");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 card-shadow">
      <div className="mb-6">
        <MailLogo size="md" />
      </div>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10">
          <Shield className="h-6 w-6 text-brand-blue" />
        </div>
        <h1 className="text-xl font-bold text-brand-blue">Email Admin Access</h1>
        <p className="mt-1 text-sm text-muted">
          Manage {mailConfig.brandName} staff mailbox records
        </p>
        <p className="mt-2 text-xs text-muted">
          Separate from Sanity CMS. Sign in with your mail admin email and password.
        </p>
        <p className="mt-2 rounded-xl bg-section-alt px-3 py-2 text-left text-xs text-muted">
          <strong className="text-brand-blue">Accounts:</strong> Super Admin{" "}
          <code className="text-[11px]">super@abjatalstar.com</code> · Admin{" "}
          <code className="text-[11px]">admin@abjatalstar.com</code> · Editor{" "}
          <code className="text-[11px]">editor@abjatalstar.com</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-brand-blue">
            Admin email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              placeholder="admin@abjatalstar.com"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-brand-blue">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              placeholder="Enter your admin password"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue-light disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>
    </div>
  );
}
