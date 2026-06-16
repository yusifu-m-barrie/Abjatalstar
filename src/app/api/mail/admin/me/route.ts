import { NextResponse } from "next/server";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isMailAdminAuthenticated();
  return NextResponse.json({ authenticated });
}
