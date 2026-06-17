type CpanelResponse<T = unknown> = {
  status?: number;
  data?: T;
  errors?: string[] | null;
  warnings?: string[] | null;
};

export function isCpanelConfigured(): boolean {
  return Boolean(
    process.env.CPANEL_HOST &&
      process.env.CPANEL_USERNAME &&
      process.env.CPANEL_API_TOKEN
  );
}

function getCpanelHost(): string {
  const raw = process.env.CPANEL_HOST;
  if (!raw) throw new Error("CPANEL_HOST is not configured.");
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export async function cpanelUapi<T = unknown>(
  module: string,
  func: string,
  params: Record<string, string | number>
): Promise<T> {
  const host = getCpanelHost();
  const user = process.env.CPANEL_USERNAME;
  const token = process.env.CPANEL_API_TOKEN;

  if (!user || !token) {
    throw new Error("cPanel API credentials are not configured.");
  }

  const url = new URL(`https://${host}:2083/execute/${module}/${func}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `cpanel ${user}:${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown network error.";
    throw new Error(
      `Could not reach HostGator cPanel API at https://${host}:2083. Check CPANEL_HOST, firewall/port 2083 access, and cPanel API token. (${detail})`
    );
  }

  let payload: CpanelResponse<T>;
  try {
    payload = (await response.json()) as CpanelResponse<T>;
  } catch {
    throw new Error(
      `HostGator cPanel API returned a non-JSON response (${response.status}). Verify CPANEL_HOST and that cPanel API access is enabled.`
    );
  }

  if (!response.ok || payload.status !== 1) {
    const message =
      payload.errors?.filter(Boolean).join(" ") ||
      `cPanel API request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload.data as T;
}

export async function cpanelAddMailbox(
  localPart: string,
  password: string,
  domain: string
): Promise<void> {
  await cpanelUapi("Email", "add_pop", {
    email: localPart,
    password,
    domain,
    quota: 0,
  });
}

export async function cpanelUpdateMailboxPassword(
  localPart: string,
  password: string,
  domain: string
): Promise<void> {
  await cpanelUapi("Email", "passwd_pop", {
    email: localPart,
    password,
    domain,
  });
}

export async function cpanelDeleteMailbox(
  localPart: string,
  domain: string
): Promise<void> {
  await cpanelUapi("Email", "delete_pop", {
    email: localPart,
    domain,
  });
}
