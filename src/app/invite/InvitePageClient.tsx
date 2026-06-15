"use client";

import Link from "next/link";

export default function InvitePageClient() {
  function openIdentity() {
    const identity = (
      window as Window & {
        netlifyIdentity?: { open: (mode?: string) => void };
      }
    ).netlifyIdentity;
    if (!identity) return;
    const hash = window.location.hash || "";
    identity.open(hash.includes("invite_token") ? "signup" : "login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          Abjatal Star — Content Manager
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Use the popup to set your password or log in. If nothing appears,
          click the button below.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-[#1a237e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#151b60]"
          onClick={openIdentity}
        >
          Open login
        </button>
        <p className="mt-4 text-xs text-slate-500">
          Already set up?{" "}
          <Link href="/admin" className="font-medium text-[#1a237e] underline">
            Go to admin
          </Link>
        </p>
      </div>
    </div>
  );
}
