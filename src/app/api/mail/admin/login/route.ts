import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getMailAdminCookieOptions,
} from "@/lib/mail-admin-auth";
import { authenticateMailAdmin } from "@/lib/mail-admin-roles";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    const session = authenticateMailAdmin(email, password);
    if (!session) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = createAdminSessionToken(session);
    const cookie = getMailAdminCookieOptions();
    const response = NextResponse.json({
      success: true,
      user: { email: session.email, role: session.role },
    });
    response.cookies.set(cookie.name, token, cookie);
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
