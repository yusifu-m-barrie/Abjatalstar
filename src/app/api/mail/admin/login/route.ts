import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getMailAdminCookieOptions,
} from "@/lib/mail-admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    const adminPassword = process.env.MAIL_ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Mail admin access is not configured." },
        { status: 503 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const cookie = getMailAdminCookieOptions();
    const response = NextResponse.json({ success: true });
    response.cookies.set(cookie.name, token, cookie);
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
