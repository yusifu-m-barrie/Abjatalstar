import { NextResponse } from "next/server";
import { getMailAdminSession } from "@/lib/mail-admin-auth";
import { getRoleLabel } from "@/lib/mail-admin-roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getMailAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      role: session.role,
      roleLabel: getRoleLabel(session.role),
    },
  });
}
