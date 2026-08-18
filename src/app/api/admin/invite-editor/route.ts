import { NextRequest, NextResponse } from "next/server";
import { projectId } from "../../../../../sanity/env";
import {
  inviteSanityMember,
  listSanityInvites,
  listSanityMembers,
  listSanityRoles,
  resolveInviteAccessToken,
} from "@/lib/sanity-access";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSessionToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token || null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const sessionToken = getSessionToken(request);
  const adminEmail = request.headers.get("x-sanity-admin-email");

  const access = await resolveInviteAccessToken({
    sessionToken,
    adminEmail,
  });
  if (!access.ok) return errorResponse(access.message, access.status);
  if (!projectId) return errorResponse("Sanity is not configured.", 500);

  try {
    const [members, invites, availableRoles] = await Promise.all([
      listSanityMembers(access.token),
      listSanityInvites(access.token),
      listSanityRoles(access.token),
    ]);

    const editorRole = availableRoles.find((role) => role.name === "editor");
    const websiteEditorRoles = availableRoles.filter((role) => role.canEditWebsite);

    return NextResponse.json({
      members,
      invites,
      availableRoles,
      canInviteEditor: Boolean(editorRole),
      planNote: editorRole
        ? null
        : "Your Sanity project is on the Free plan. Only Administrator and Viewer are available. Upgrade to Growth ($15/seat/month) to invite Editors who can update the website without full admin access.",
      manageUrl: `https://www.sanity.io/manage/project/${projectId}/members`,
      pricingUrl: "https://www.sanity.io/pricing",
      studioUrl: "/admin",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.abjatalstar.com",
      recommendedRoles: websiteEditorRoles.map((role) => role.name),
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message =
      error instanceof Error ? error.message : "Could not load Sanity members.";
    return errorResponse(message, status);
  }
}

export async function POST(request: NextRequest) {
  const sessionToken = getSessionToken(request);

  let email = "";
  let role = "editor";
  let adminEmail = request.headers.get("x-sanity-admin-email");

  try {
    const body = (await request.json()) as {
      email?: unknown;
      role?: unknown;
      adminEmail?: unknown;
    };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    role =
      typeof body.role === "string" && body.role.trim()
        ? body.role.trim().toLowerCase()
        : "editor";
    if (typeof body.adminEmail === "string" && body.adminEmail.trim()) {
      adminEmail = body.adminEmail.trim().toLowerCase();
    }
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  if (!EMAIL_RE.test(email)) {
    return errorResponse("Enter a valid email address.", 400);
  }

  const access = await resolveInviteAccessToken({
    sessionToken,
    adminEmail,
  });
  if (!access.ok) return errorResponse(access.message, access.status);
  if (!projectId) return errorResponse("Sanity is not configured.", 500);

  try {
    const availableRoles = await listSanityRoles(access.token);
    const invite = await inviteSanityMember(
      access.token,
      email,
      role,
      availableRoles
    );

    const roleTitle =
      availableRoles.find((entry) => entry.name === invite.role)?.title ??
      invite.role;

    return NextResponse.json({
      success: true,
      invite,
      message: `Invitation sent to ${email} as ${roleTitle}. They can sign in at /admin after accepting the Sanity email.`,
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message =
      error instanceof Error ? error.message : "Could not send the invitation.";
    return errorResponse(message, status);
  }
}
