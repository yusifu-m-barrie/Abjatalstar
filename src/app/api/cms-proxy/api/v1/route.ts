import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, getAdminCookieName } from "@/lib/admin-auth";
import { handleCmsProxyAction } from "@/lib/cms-github-proxy";

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
