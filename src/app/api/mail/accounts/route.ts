import { NextRequest, NextResponse } from "next/server";
import { requireMailPermission } from "@/lib/mail-admin-auth";
import { logEmailActivity } from "@/lib/email-accounts/activity-log";
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
import { getHostgatorPublicStatus } from "@/lib/mail-hostgator-status";

export const dynamic = "force-dynamic";

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
  const auth = await requireMailPermission("read_accounts");
  if (auth.error) return auth.error;

  const accounts = await listEmailAccounts();
  const hostgator = getHostgatorPublicStatus();

  return NextResponse.json({
    accounts,
    hostgatorConnected: hostgator.hostgatorConnected,
    emailProvider: hostgator.emailProvider,
    user: {
      email: auth.session.email,
      role: auth.session.role,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireMailPermission("write_accounts");
  if (auth.error) return auth.error;

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

    const cpanelReady = isCpanelConfigured();

    if (cpanelReady) {
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
    } else if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return NextResponse.json(
          { error: "Passwords do not match." },
          { status: 400 }
        );
      }
      if (password && !isValidMailboxPassword(password)) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters." },
          { status: 400 }
        );
      }
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
    const provision = await provider.createAccount(input, {
      password: password || undefined,
    });

    if (
      !provision.success &&
      (provision.requiresManualSetup || shouldFallbackToInactive(provision.message))
    ) {
      const account = await createEmailAccountRecord({
        ...input,
        status: "inactive",
        notes:
          notes ||
          `Pending HostGator mailbox for ${email}. Create in cPanel → Email Accounts, then mark Active.`,
      });

      await logEmailActivity({
        action: "created",
        accountId: account.id,
        accountEmail: account.email,
        accountName: account.fullName,
        performedBy: auth.session.email,
        performedByRole: auth.session.role,
        details: "Saved as inactive — HostGator mailbox pending.",
      });

      const manualMessage = cpanelReady
        ? `Staff record saved as Inactive. HostGator mailbox creation failed (${provision.message}). Edit this staff member and set a password to retry, or create ${email} manually in HostGator cPanel.`
        : `Staff record saved as Inactive. Create ${email} inside HostGator cPanel → Email Accounts, then return here and mark it Active.`;

      return NextResponse.json({
        account,
        pendingSetup: true,
        provision: { ...provision, message: manualMessage },
      });
    }

    if (!provision.success) {
      return NextResponse.json(
        {
          error:
            provision.message ||
            "HostGator mailbox creation failed. Staff record was not saved.",
        },
        { status: 502 }
      );
    }

    const account = await createEmailAccountRecord({
      ...input,
      status: "active",
      notes: notes || "Created via AbjatalStar email admin and HostGator cPanel.",
    });

    await logEmailActivity({
      action: "created",
      accountId: account.id,
      accountEmail: account.email,
      accountName: account.fullName,
      performedBy: auth.session.email,
      performedByRole: auth.session.role,
      details: "Mailbox created in HostGator and marked active.",
    });

    return NextResponse.json({ account, provision });
  } catch (error) {
    console.error("Create email account error:", error);
    return NextResponse.json(
      { error: "Failed to create email account. Please try again." },
      { status: 500 }
    );
  }
}
