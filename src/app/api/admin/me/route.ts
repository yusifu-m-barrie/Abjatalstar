import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession(
    request.cookies.get(getAdminCookieName())?.value
  );

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
  });
}
