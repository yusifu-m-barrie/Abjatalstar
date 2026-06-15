import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const configPath = join(process.cwd(), "public", "admin", "config.yml");

  try {
    const config = readFileSync(configPath, "utf-8");
    return new NextResponse(config, {
      status: 200,
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "CMS config file not found" },
      { status: 404 }
    );
  }
}
