"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MailLogo from "@/components/mail/MailLogo";
import type { EmailAccount, EmailAccountStatus } from "@/lib/email-accounts/types";
import { buildStaffEmail, parseEmailLocalPart } from "@/lib/mail-email";
import { mailConfig } from "@/lib/mail-config";

type FormState = {
  fullName: string;
  emailLocalPart: string;
  role: string;
  department: string;
  status: EmailAccountStatus;
  notes: string;
  password: string;
  confirmPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const emptyForm: FormState = {
  fullName: "",
  emailLocalPart: "",
  role: "",
  department: "",
  status: "active",
  notes: "",
  password: "",
  confirmPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export default function EmailAccountsDashboard() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [cpanelConfigured, setCpanelConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EmailAccountStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const previewEmail = useMemo(() => {
    if (!form.emailLocalPart.trim()) return "";
    try {
      return buildStaffEmail(form.emailLocalPart);
    } catch {
      return "";
    }
  }, [form.emailLocalPart]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mail/accounts");
      if (res.status === 401) {
        router.push("/admin/email-accounts/login");
        return;
      }
      const data = (await res.json()) as {
        accounts?: EmailAccount[];
        cpanelConfigured?: boolean;
      };
      setAccounts(data.accounts ?? []);
      setCpanelConfigured(Boolean(data.cpanelConfigured));
    } catch {
      setError("Failed to load email accounts.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (statusFilter !== "all" && account.status !== statusFilter) return false;
      if (!q) return true;
      return (
        account.fullName.toLowerCase().includes(q) ||
        account.email.toLowerCase().includes(q) ||
        account.role.toLowerCase().includes(q) ||
        account.department.toLowerCase().includes(q)
      );
    });
  }, [accounts, search, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setInstruction(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (account: EmailAccount) => {
    setEditingId(account.id);
    setForm({
      fullName: account.fullName,
      emailLocalPart: parseEmailLocalPart(account.email),
      role: account.role,
      department: account.department,
      status: account.status,
      notes: account.notes,
      password: "",
      confirmPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setInstruction(null);
    setError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setInstruction(null);

    try {
      if (!editingId) {
        if (!form.password || !form.confirmPassword) {
          setError("Mailbox password and confirmation are required.");
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
      }

      const url = editingId
        ? `/api/mail/accounts/${editingId}`
        : "/api/mail/accounts";
      const method = editingId ? "PATCH" : "POST";

      const payload = editingId
        ? {
            fullName: form.fullName,
            role: form.role,
            department: form.department,
            status: form.status,
            notes: form.notes,
            newPassword: form.newPassword || undefined,
            confirmNewPassword: form.confirmNewPassword || undefined,
          }
        : {
            fullName: form.fullName,
            emailLocalPart: form.emailLocalPart,
            role: form.role,
            department: form.department,
            notes: form.notes,
            password: form.password,
            confirmPassword: form.confirmPassword,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        provision?: { message?: string };
        message?: string;
      };

      if (!res.ok) {
        setError(data.error ?? data.provision?.message ?? "Save failed.");
        return;
      }

      const successMessage = data.provision?.message ?? data.message;
      if (successMessage) setInstruction(successMessage);

      setShowForm(false);
      await loadAccounts();
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this staff mailbox from HostGator and this dashboard?")) return;
    const res = await fetch(`/api/mail/accounts/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string; message?: string };
    if (!res.ok) {
      setError(data.error ?? "Delete failed.");
      return;
    }
    if (data.message) setInstruction(data.message);
    await loadAccounts();
  };

  const copyEmail = async (id: string, email: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/mail/admin/logout", { method: "POST" });
    router.push("/admin/email-accounts/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-section-alt">
      <header className="border-b border-border bg-white">
        <div className="container-custom flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <MailLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-brand-blue">Email Accounts</h1>
              <p className="text-sm text-muted">{mailConfig.brandName} staff mailbox registry</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/mail"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-brand-blue hover:bg-section-alt"
            >
              <Mail className="h-4 w-4" />
              Staff Mail Login
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-section-alt"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container-custom px-4 py-8 sm:px-6 lg:px-8">
        <div
          className={`mb-6 rounded-2xl border p-4 text-sm ${
            cpanelConfigured
              ? "border-brand-green/30 bg-brand-green/5 text-brand-blue"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {cpanelConfigured ? (
            <p>
              <strong>HostGator connected.</strong> New staff emails are created in cPanel
              automatically with the password you set. Staff use that password at{" "}
              <Link href="/mail" className="font-medium text-brand-green hover:underline">
                /mail
              </Link>
              . Passwords are never stored in this dashboard.
            </p>
          ) : (
            <div className="space-y-2">
              <p>
                <strong>HostGator API not configured.</strong> Staff records can still be saved as{" "}
                <strong>Inactive</strong>, but mailboxes are not created in HostGator until you add
                these to your local <code className="rounded bg-white/80 px-1">.env</code> and on{" "}
                <strong>Vercel</strong>:
              </p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>
                  <code className="rounded bg-white/80 px-1">CPANEL_HOST</code> ={" "}
                  <code className="rounded bg-white/80 px-1">abjatalstar.com</code>
                </li>
                <li>
                  <code className="rounded bg-white/80 px-1">CPANEL_USERNAME</code> = your cPanel
                  login username
                </li>
                <li>
                  <code className="rounded bg-white/80 px-1">CPANEL_API_TOKEN</code> = from cPanel
                  → Security → Manage API Tokens
                </li>
                <li>
                  <code className="rounded bg-white/80 px-1">EMAIL_PROVIDER</code> ={" "}
                  <code className="rounded bg-white/80 px-1">cpanel</code>
                </li>
              </ul>
              <p className="text-xs">
                Restart <code className="rounded bg-white/80 px-1">npm run dev</code> after updating
                .env. Then edit an Inactive staff member, set a password, and save to create the
                mailbox in HostGator.
              </p>
            </div>
          )}
        </div>

        {instruction && (
          <div className="mb-6 rounded-2xl border border-brand-green/30 bg-brand-green/5 p-4 text-sm text-brand-blue">
            {instruction}
          </div>
        )}

        {error && !showForm && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, role…"
                className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-green"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-light"
          >
            <Plus className="h-4 w-4" />
            Add Staff Email
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white card-shadow">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading accounts…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted">
              No email accounts match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-section-alt text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Staff</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((account) => (
                    <tr key={account.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4">
                        <p className="font-medium text-brand-blue">{account.fullName}</p>
                        <p className="text-xs text-muted">
                          Added {new Date(account.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs sm:text-sm">{account.email}</span>
                          <button
                            type="button"
                            onClick={() => copyEmail(account.id, account.email)}
                            className="rounded-lg p-1.5 text-muted hover:bg-section-alt hover:text-brand-blue"
                            title="Copy email"
                          >
                            {copiedId === account.id ? (
                              <Check className="h-4 w-4 text-brand-green" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted">{account.role || "—"}</td>
                      <td className="px-4 py-4 text-muted">{account.department || "—"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            account.status === "active"
                              ? "bg-brand-green/10 text-brand-green"
                              : "bg-slate-100 text-muted"
                          }`}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(account)}
                            className="rounded-lg p-2 text-muted hover:bg-section-alt hover:text-brand-blue"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(account.id)}
                            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 card-shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-blue">
                {editingId ? "Edit Staff Email" : "Add Staff Email"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-muted hover:bg-section-alt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <Field
                label="Full name"
                value={form.fullName}
                onChange={(v) => setForm({ ...form, fullName: v })}
              />

              {editingId ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-blue">
                    Email address
                  </label>
                  <div className="rounded-xl border border-border bg-section-alt px-4 py-2.5 font-mono text-sm text-brand-blue">
                    {previewEmail || `${form.emailLocalPart}@${mailConfig.mailDomain}`}
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="email-local-part"
                    className="mb-1.5 block text-sm font-medium text-brand-blue"
                  >
                    Email username
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-border focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20">
                    <input
                      id="email-local-part"
                      value={form.emailLocalPart}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          emailLocalPart: e.target.value.toLowerCase().replace(/\s/g, ""),
                        })
                      }
                      placeholder="ayon"
                      className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none"
                    />
                    <span className="flex items-center border-l border-border bg-section-alt px-4 text-sm text-muted">
                      @{mailConfig.mailDomain}
                    </span>
                  </div>
                  {previewEmail && (
                    <p className="mt-1.5 text-xs text-brand-green">
                      Will be created as <strong>{previewEmail}</strong>
                    </p>
                  )}
                </div>
              )}

              {!editingId ? (
                <>
                  <PasswordField
                    label="Mailbox password"
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v })}
                    placeholder="Password staff will use at /mail"
                  />
                  <PasswordField
                    label="Confirm password"
                    value={form.confirmPassword}
                    onChange={(v) => setForm({ ...form, confirmPassword: v })}
                    placeholder="Re-enter password"
                  />
                  <p className="text-xs text-muted">
                    This password is sent to HostGator to create the mailbox. It is{" "}
                    <strong>not stored</strong> in this dashboard. Share it securely with the staff
                    member.
                  </p>
                </>
              ) : (
                <>
                  <PasswordField
                    label={
                      form.status === "inactive" && cpanelConfigured
                        ? "Mailbox password (creates in HostGator on save)"
                        : "New password (optional)"
                    }
                    value={form.newPassword}
                    onChange={(v) => setForm({ ...form, newPassword: v })}
                    placeholder={
                      form.status === "inactive" && cpanelConfigured
                        ? "Required to create mailbox in HostGator"
                        : "Leave blank to keep current password"
                    }
                  />
                  <PasswordField
                    label="Confirm new password"
                    value={form.confirmNewPassword}
                    onChange={(v) => setForm({ ...form, confirmNewPassword: v })}
                    placeholder="Re-enter new password"
                  />
                  {form.status === "inactive" && cpanelConfigured && (
                    <p className="text-xs text-muted">
                      This staff member is <strong>Inactive</strong>. Enter a password and save to
                      create their mailbox in HostGator automatically.
                    </p>
                  )}
                </>
              )}

              <Field label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
              <Field
                label="Department"
                value={form.department}
                onChange={(v) => setForm({ ...form, department: v })}
              />

              {editingId && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-blue">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as EmailAccountStatus })
                    }
                    className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-green"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-blue">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:bg-brand-blue-light disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingId ? "Save changes" : "Create mailbox"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-brand-blue">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-brand-blue">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
      />
    </div>
  );
}
