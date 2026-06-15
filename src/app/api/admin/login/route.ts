import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminCookieName,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          error:
            "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel.",
        },
        { status: 503 }
      );
    }

    if (!process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json(
        {
          error:
            "Admin login is not configured. Set ADMIN_SESSION_SECRET in Vercel.",
        },
        { status: 503 }
      );
    }

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
