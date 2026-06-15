import { NextResponse } from "next/server";
import { getAdminCookieName, sessionCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
