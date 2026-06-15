"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminToolbar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-[9999] flex h-14 items-center justify-between gap-3 border-b border-[#151b60] bg-[#1a237e] px-4 shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/abjatal-star-logo.png"
          alt="Abjatal Star"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full bg-white p-0.5"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            Content Manager
          </p>
          <p className="hidden truncate text-xs text-indigo-200 sm:block">
            Abjatal Star Enterprise
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="hidden rounded-lg px-3 py-2 text-xs font-medium text-white hover:bg-white/10 sm:inline-block"
        >
          View site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-60"
        >
          {loggingOut ? "..." : "Log out"}
        </button>
      </div>
    </header>
  );
}
