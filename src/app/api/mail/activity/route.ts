import { NextResponse } from "next/server";
import { requireMailPermission } from "@/lib/mail-admin-auth";
import { listEmailActivityLogs } from "@/lib/email-accounts/activity-log";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireMailPermission("view_activity");
  if (auth.error) return auth.error;

  const logs = await listEmailActivityLogs(100);
  return NextResponse.json({ logs });
}
