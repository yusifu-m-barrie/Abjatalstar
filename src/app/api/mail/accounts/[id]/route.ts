import { NextRequest, NextResponse } from "next/server";
import { isMailAdminAuthenticated } from "@/lib/mail-admin-auth";
import {
  deleteEmailAccountRecord,
  getEmailAccount,
  updateEmailAccountRecord,
} from "@/lib/email-accounts/store";

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
    const body = await request.json();
    const update: Record<string, string> = {};

    if (typeof body.fullName === "string") update.fullName = body.fullName.trim();
    if (typeof body.email === "string") update.email = body.email.trim().toLowerCase();
    if (typeof body.role === "string") update.role = body.role.trim();
    if (typeof body.department === "string") update.department = body.department.trim();
    if (body.status === "active" || body.status === "inactive") update.status = body.status;
    if (typeof body.notes === "string") update.notes = body.notes.trim();

    const account = await updateEmailAccountRecord(id, update);
    if (!account) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ account });
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
  const deleted = await deleteEmailAccountRecord(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
