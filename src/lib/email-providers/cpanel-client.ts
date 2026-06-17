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

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `cpanel ${user}:${token}`,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as CpanelResponse<T>;

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
