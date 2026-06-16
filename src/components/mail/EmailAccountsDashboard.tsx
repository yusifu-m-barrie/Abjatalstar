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
import { mailConfig } from "@/lib/mail-config";

type FormState = {
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: EmailAccountStatus;
  notes: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  role: "",
  department: "",
  status: "inactive",
  notes: "",
};

export default function EmailAccountsDashboard() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
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

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mail/accounts");
      if (res.status === 401) {
        router.push("/admin/email-accounts/login");
        return;
      }
      const data = (await res.json()) as { accounts?: EmailAccount[] };
      setAccounts(data.accounts ?? []);
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
      email: account.email,
      role: account.role,
      department: account.department,
      status: account.status,
      notes: account.notes,
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
      const url = editingId
        ? `/api/mail/accounts/${editingId}`
        : "/api/mail/accounts";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        error?: string;
        provision?: { message?: string };
      };

      if (!res.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }

      if (data.provision?.message) {
        setInstruction(data.provision.message);
      }

      setShowForm(false);
      await loadAccounts();
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this email account record?")) return;
    await fetch(`/api/mail/accounts/${id}`, { method: "DELETE" });
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
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Manual HostGator workflow:</strong> This dashboard tracks staff mailboxes.
          Create the actual mailbox in HostGator cPanel → Email Accounts, then mark it{" "}
          <strong>Active</strong> here. No DNS or cPanel credentials are changed by this app.
        </div>

        {instruction && (
          <div className="mb-6 rounded-2xl border border-brand-green/30 bg-brand-green/5 p-4 text-sm text-brand-blue">
            {instruction}
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
              <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
              <Field
                label="Email address"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder={`staff@${mailConfig.mailDomain}`}
              />
              <Field label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
              <Field label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-blue">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as EmailAccountStatus })}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-green"
                >
                  <option value="inactive">Inactive (pending HostGator setup)</option>
                  <option value="active">Active</option>
                </select>
              </div>
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

            {!editingId && (
              <p className="mt-4 rounded-xl bg-section-alt p-3 text-xs text-muted">
                After saving, create this mailbox in HostGator cPanel → Email Accounts, then
                return here and mark it Active.
              </p>
            )}

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
                Save
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
