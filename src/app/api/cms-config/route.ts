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
      const yamlBackend = config.backend as { branch?: string } | undefined;

      const localConfig = {
        ...config,
        local_backend: true,
        backend: {
          name: "proxy",
          branch: yamlBackend?.branch ?? "main",
          proxy_url: "http://localhost:8081/api/v1",
        },
      };

      return new NextResponse(stringifyYaml(localConfig), {
        status: 200,
        headers: {
          "Content-Type": "text/yaml; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const url = new URL(request.url);
    // Always match the host the user is actually on (avoids www vs non-www cookie issues).
    const origin = `${url.protocol}//${url.host}`;

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
