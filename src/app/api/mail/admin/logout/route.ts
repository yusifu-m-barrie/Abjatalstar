import { NextResponse } from "next/server";
import { getMailAdminCookieOptions } from "@/lib/mail-admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookie = getMailAdminCookieOptions();
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookie.name, "", { ...cookie, maxAge: 0 });
  return response;
}
