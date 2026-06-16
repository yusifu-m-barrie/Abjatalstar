import { NextRequest, NextResponse } from "next/server";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";
import {
  createEmailAccountRecord,
  listEmailAccounts,
} from "@/lib/email-accounts/store";
import type { EmailAccountInput } from "@/lib/email-accounts/types";
import { getEmailProvider } from "@/lib/email-providers";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  if (!(await isMailAdminAuthenticated())) return unauthorized();

  const accounts = await listEmailAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(request: NextRequest) {
  if (!(await isMailAdminAuthenticated())) return unauthorized();

  try {
    const body = await request.json();
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = typeof body.role === "string" ? body.role.trim() : "";
    const department =
      typeof body.department === "string" ? body.department.trim() : "";
    const status = body.status === "active" ? "active" : "inactive";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!fullName || !email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Full name and a valid email address are required." },
        { status: 400 }
      );
    }

    const input: EmailAccountInput = {
      fullName,
      email,
      role,
      department,
      status,
      notes,
    };

    const account = await createEmailAccountRecord(input);
    const provider = getEmailProvider();
    const provision = await provider.createAccount(account);

    return NextResponse.json({
      account,
      provision,
    });
  } catch (error) {
    console.error("Create email account error:", error);
    return NextResponse.json(
      { error: "Failed to create email account record." },
      { status: 500 }
    );
  }
}
