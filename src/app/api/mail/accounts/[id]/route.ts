import { NextRequest, NextResponse } from "next/server";
import { requireMailPermission } from "@/lib/mail-admin-auth";
import { logEmailActivity } from "@/lib/email-accounts/activity-log";
import {
  deleteEmailAccountRecord,
  getEmailAccount,
  updateEmailAccountRecord,
} from "@/lib/email-accounts/store";
import type { EmailAccountStatus } from "@/lib/email-accounts/types";
import { isValidMailboxPassword } from "@/lib/mail-email";
import { getCpanelEmailProvider } from "@/lib/email-providers";
import { isCpanelConfigured } from "@/lib/email-providers/cpanel-client";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireMailPermission("read_accounts");
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const account = await getEmailAccount(id);
  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ account });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireMailPermission("write_accounts");
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const existing = await getEmailAccount(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const update: Record<string, string> = {};
    let passwordMessage: string | undefined;

    if (typeof body.fullName === "string") update.fullName = body.fullName.trim();
    if (typeof body.role === "string") update.role = body.role.trim();
    if (typeof body.department === "string") update.department = body.department.trim();
    if (body.status === "active" || body.status === "inactive") {
      update.status = body.status;
    }
    if (typeof body.notes === "string") update.notes = body.notes.trim();

    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmNewPassword =
      typeof body.confirmNewPassword === "string" ? body.confirmNewPassword : "";

    if (newPassword || confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
      }
      if (!isValidMailboxPassword(newPassword)) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }

      if (!isCpanelConfigured()) {
        return NextResponse.json(
          {
            error:
              "HostGator API is not connected. Mailbox passwords can only be set when cPanel API is configured server-side.",
          },
          { status: 503 }
        );
      }

      if (existing.status === "inactive") {
        const createResult = await getCpanelEmailProvider().createAccount(
          {
            fullName: update.fullName ?? existing.fullName,
            email: existing.email,
            role: update.role ?? existing.role,
            department: update.department ?? existing.department,
            status: "active",
            notes: update.notes ?? existing.notes,
          },
          { password: newPassword }
        );
        if (!createResult.success) {
          return NextResponse.json({ error: createResult.message }, { status: 502 });
        }
        update.status = "active";
        passwordMessage = createResult.message;
      } else {
        const passwordResult = await getCpanelEmailProvider().updatePassword(
          existing.email,
          newPassword
        );
        if (!passwordResult.success) {
          return NextResponse.json({ error: passwordResult.message }, { status: 502 });
        }
        passwordMessage = passwordResult.message;
      }
    }

    const account = await updateEmailAccountRecord(id, update);
    if (!account) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const previousStatus = existing.status;
    const nextStatus = (update.status as EmailAccountStatus | undefined) ?? previousStatus;

    if (previousStatus !== nextStatus) {
      await logEmailActivity({
        action: nextStatus === "active" ? "activated" : "deactivated",
        accountId: account.id,
        accountEmail: account.email,
        accountName: account.fullName,
        performedBy: auth.session.email,
        performedByRole: auth.session.role,
        details: `Status changed from ${previousStatus} to ${nextStatus}.`,
      });
    } else {
      await logEmailActivity({
        action: "updated",
        accountId: account.id,
        accountEmail: account.email,
        accountName: account.fullName,
        performedBy: auth.session.email,
        performedByRole: auth.session.role,
        details: passwordMessage ? "Record updated and mailbox password changed in HostGator." : "Record updated.",
      });
    }

    return NextResponse.json({ account, message: passwordMessage });
  } catch (error) {
    console.error("Update email account error:", error);
    return NextResponse.json(
      { error: "Failed to update email account. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireMailPermission("delete_accounts");
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const existing = await getEmailAccount(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let removalMessage = "Removed from dashboard.";
  if (isCpanelConfigured()) {
    const removal = await getCpanelEmailProvider().deleteMailbox(existing.email);
    if (!removal.success) {
      return NextResponse.json(
        {
          error:
            removal.message ||
            "Failed to delete mailbox from HostGator. The dashboard record was not removed.",
        },
        { status: 502 }
      );
    }
    removalMessage = removal.message;
  }

  const deleted = await deleteEmailAccountRecord(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logEmailActivity({
    action: "deleted",
    accountId: existing.id,
    accountEmail: existing.email,
    accountName: existing.fullName,
    performedBy: auth.session.email,
    performedByRole: auth.session.role,
    details: isCpanelConfigured()
      ? "Mailbox removed from HostGator and dashboard record deleted."
      : "Dashboard record deleted.",
  });

  return NextResponse.json({ success: true, message: removalMessage });
}
