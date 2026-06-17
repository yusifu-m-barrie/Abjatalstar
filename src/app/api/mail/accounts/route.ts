import { NextRequest, NextResponse } from "next/server";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";
import {
  createEmailAccountRecord,
  listEmailAccounts,
} from "@/lib/email-accounts/store";
import type { EmailAccountInput } from "@/lib/email-accounts/types";
import {
  buildStaffEmail,
  isValidMailboxPassword,
  normalizeEmailLocalPart,
} from "@/lib/mail-email";
import { getEmailProvider } from "@/lib/email-providers";
import { isCpanelConfigured } from "@/lib/email-providers/cpanel-client";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function shouldFallbackToInactive(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not reach hostgator cpanel api") ||
    normalized.includes("fetch failed") ||
    normalized.includes("timed out") ||
    normalized.includes("econnrefused") ||
    normalized.includes("enotfound")
  );
}

export async function GET() {
  if (!(await isMailAdminAuthenticated())) return unauthorized();

  const accounts = await listEmailAccounts();
  return NextResponse.json({
    accounts,
    cpanelConfigured: isCpanelConfigured(),
  });
}

export async function POST(request: NextRequest) {
  if (!(await isMailAdminAuthenticated())) return unauthorized();

  try {
    const body = await request.json();
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const emailLocalPart =
      typeof body.emailLocalPart === "string"
        ? normalizeEmailLocalPart(body.emailLocalPart)
        : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const role = typeof body.role === "string" ? body.role.trim() : "";
    const department =
      typeof body.department === "string" ? body.department.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!fullName || !emailLocalPart) {
      return NextResponse.json(
        { error: "Full name and email username are required." },
        { status: 400 }
      );
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: "Mailbox password and confirmation are required." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (!isValidMailboxPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    let email: string;
    try {
      email = buildStaffEmail(emailLocalPart);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid email username." },
        { status: 400 }
      );
    }

    const input: EmailAccountInput = {
      fullName,
      email,
      role,
      department,
      status: "inactive",
      notes,
    };

    const provider = getEmailProvider();
    const provision = await provider.createAccount(input, { password });

    if (!provision.success && (provision.requiresManualSetup || shouldFallbackToInactive(provision.message))) {
      const account = await createEmailAccountRecord({
        ...input,
        status: "inactive",
        notes:
          notes ||
          `Pending HostGator mailbox for ${email}. Add CPANEL_* env vars for auto-create, or create manually in cPanel.`,
      });

      return NextResponse.json({
        account,
        pendingSetup: true,
        provision: {
          ...provision,
          message: `Staff record saved as Inactive. HostGator mailbox creation failed right now (${provision.message}). Check CPANEL_HOST/CPANEL_USERNAME/CPANEL_API_TOKEN, then edit this staff member and set a password to create the mailbox. Until then, create ${email} manually in HostGator cPanel with the password you chose.`,
        },
      });
    }

    if (!provision.success) {
      return NextResponse.json(
        { error: provision.message, provision },
        { status: 502 }
      );
    }

    const account = await createEmailAccountRecord({
      ...input,
      status: "active",
      notes: notes || "Created via AbjatalStar email admin and HostGator cPanel.",
    });

    return NextResponse.json({
      account,
      provision,
    });
  } catch (error) {
    console.error("Create email account error:", error);
    return NextResponse.json(
      { error: "Failed to create email account." },
      { status: 500 }
    );
  }
}
