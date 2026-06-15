import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

function isLocalRequest(request: Request) {
  const host = request.headers.get("host") ?? "";
  return host.includes("localhost") || host.includes("127.0.0.1");
}

export async function GET(request: Request) {
  const configPath = join(process.cwd(), "public", "admin", "config.yml");

  try {
    const configText = readFileSync(configPath, "utf-8");
    const config = parseYaml(configText) as Record<string, unknown>;

    if (isLocalRequest(request)) {
      return new NextResponse(stringifyYaml(config), {
        status: 200,
        headers: {
          "Content-Type": "text/yaml; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const url = new URL(request.url);
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      `${url.protocol}//${url.host}`;

    const yamlBackend = config.backend as { branch?: string } | undefined;

    const productionConfig = {
      ...config,
      local_backend: false,
      backend: {
        name: "proxy",
        branch: yamlBackend?.branch ?? process.env.GITHUB_BRANCH ?? "main",
        proxy_url: `${origin}/api/cms-proxy/api/v1`,
      },
    };

    return new NextResponse(stringifyYaml(productionConfig), {
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
