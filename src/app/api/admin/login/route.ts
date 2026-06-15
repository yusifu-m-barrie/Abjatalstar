import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminCookieName,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email ?? "";
    const password = body.password ?? "";

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createAdminSession(email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(getAdminCookieName(), token, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json(
      { error: "Admin login is not configured on this server" },
      { status: 500 }
    );
  }
}
