import { NextRequest, NextResponse } from "next/server";
import { projectId } from "../../../../../sanity/env";
import {
  inviteSanityEditor,
  listSanityInvites,
  listSanityMembers,
  requireSanityAdmin,
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
  const token = getSessionToken(request);
  if (!token) {
    return errorResponse("Sign in to Sanity Studio as an administrator first.", 401);
  }
  if (!projectId) {
    return errorResponse("Sanity is not configured.", 500);
  }

  const auth = await requireSanityAdmin(token);
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  try {
    const [members, invites] = await Promise.all([
      listSanityMembers(token),
      listSanityInvites(token),
    ]);
    return NextResponse.json({
      members,
      invites,
      manageUrl: `https://www.sanity.io/manage/project/${projectId}/members`,
      studioUrl: "/admin",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.abjatalstar.com",
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message =
      error instanceof Error ? error.message : "Could not load Sanity members.";
    return errorResponse(message, status);
  }
}

export async function POST(request: NextRequest) {
  const token = getSessionToken(request);
  if (!token) {
    return errorResponse("Sign in to Sanity Studio as an administrator first.", 401);
  }
  if (!projectId) {
    return errorResponse("Sanity is not configured.", 500);
  }

  const auth = await requireSanityAdmin(token);
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  if (!EMAIL_RE.test(email)) {
    return errorResponse("Enter a valid email address.", 400);
  }

  try {
    const invite = await inviteSanityEditor(token, email);
    return NextResponse.json({
      success: true,
      invite,
      message: `Invitation sent to ${email} as Editor. They can update website content at /admin after they accept the Sanity email.`,
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message =
      error instanceof Error ? error.message : "Could not send the invitation.";
    return errorResponse(message, status);
  }
}
