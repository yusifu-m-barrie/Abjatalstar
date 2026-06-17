import { NextRequest, NextResponse } from "next/server";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";
import {
  deleteEmailAccountRecord,
  getEmailAccount,
  updateEmailAccountRecord,
} from "@/lib/email-accounts/store";
import { isValidMailboxPassword } from "@/lib/mail-email";
import { getCpanelEmailProvider } from "@/lib/email-providers";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isMailAdminAuthenticated())) return unauthorized();

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
  if (!(await isMailAdminAuthenticated())) return unauthorized();

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
    if (body.status === "active" || body.status === "inactive") update.status = body.status;
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

      const passwordResult = await getCpanelEmailProvider().updatePassword(
        existing.email,
        newPassword
      );
      if (!passwordResult.success) {
        return NextResponse.json({ error: passwordResult.message }, { status: 502 });
      }
      passwordMessage = passwordResult.message;
    }

    const account = await updateEmailAccountRecord(id, update);
    if (!account) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ account, message: passwordMessage });
  } catch (error) {
    console.error("Update email account error:", error);
    return NextResponse.json(
      { error: "Failed to update email account." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isMailAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;
  const existing = await getEmailAccount(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const removal = await getCpanelEmailProvider().deleteMailbox(existing.email);
  if (!removal.success) {
    return NextResponse.json({ error: removal.message }, { status: 502 });
  }

  const deleted = await deleteEmailAccountRecord(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: removal.message });
}
