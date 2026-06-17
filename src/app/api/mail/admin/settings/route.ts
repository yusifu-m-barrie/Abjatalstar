import { NextResponse } from "next/server";
import { requireMailPermission } from "@/lib/mail-admin-auth";
import { getCpanelSettingsForSuperAdmin } from "@/lib/mail-hostgator-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireMailPermission("manage_cpanel_settings");
  if (auth.error) return auth.error;

  return NextResponse.json({
    settings: getCpanelSettingsForSuperAdmin(),
  });
}
