import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-auth";
import { handleCmsProxyAction } from "@/lib/cms-github-proxy";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession(
    request.cookies.get(getAdminCookieName())?.value
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await handleCmsProxyAction(body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CMS proxy request failed";
    console.error("CMS proxy error:", message, error);
    return NextResponse.json(
      { error: message },
      { status: message.includes("not configured") ? 503 : 500 }
    );
  }
}
