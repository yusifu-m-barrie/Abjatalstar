import { projectId } from "../../sanity/env";

const EDITOR_INVITE_ROLE = "editor";

const ACCESS_API = "https://api.sanity.io/v2025-07-11";
const LEGACY_API = "https://api.sanity.io/v2021-06-07";

export type SanityMember = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isCurrentUser: boolean;
};

export type SanityInvite = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type AccessErrorBody = {
  message?: string;
  error?: string;
  errorCode?: string;
};

function accessUrl(path: string): string {
  if (!projectId) {
    throw new Error("Sanity project ID is not configured.");
  }
  return `${ACCESS_API}/access/project/${projectId}${path}`;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as AccessErrorBody;
    return body.message || body.error || response.statusText;
  } catch {
    return response.statusText || "Sanity request failed.";
  }
}

export async function sanityAccessFetch<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const response = await fetch(accessUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: await readErrorMessage(response),
    };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  return { ok: true, data: (await response.json()) as T };
}

export function isAdminRoleList(roles: string[]): boolean {
  return roles.some(
    (role) =>
      role === "administrator" || role === "admin" || role === "mainAdmin"
  );
}

export async function requireSanityAdmin(
  token: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const checked = await sanityAccessFetch<{
    data?: Record<string, boolean>;
  }>(
    token,
    `/user-permissions/me/check?permissions=sanity.project.members.invite`
  );

  if (checked.ok) {
    const allowed =
      checked.data.data?.["sanity.project.members.invite"] === true ||
      Object.values(checked.data.data ?? {}).some(Boolean);
    if (allowed) return { ok: true };
  }

  const users = await sanityAccessFetch<{
    data?: Array<{
      profile?: { isCurrentUser?: boolean };
      memberships?: Array<{ roleNames?: string[] }>;
    }>;
  }>(token, "/users?limit=100");

  if (users.ok) {
    const current = users.data.data?.find(
      (user) => user.profile?.isCurrentUser
    );
    const roles =
      current?.memberships?.flatMap((membership) => membership.roleNames ?? []) ??
      [];
    if (isAdminRoleList(roles)) return { ok: true };
  }

  const me = await fetch(`${LEGACY_API}/users/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });

  if (me.ok && projectId) {
    const profile = (await me.json()) as { id?: string };
    const acl = await fetch(`${LEGACY_API}/projects/${projectId}/acl`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (acl.ok) {
      const members = (await acl.json()) as Array<{
        projectUserId?: string;
        roles?: Array<{ name?: string }>;
      }>;
      const match = members.find((member) => member.projectUserId === profile.id);
      const roles = (match?.roles ?? []).map((role) => role.name ?? "");
      if (isAdminRoleList(roles)) return { ok: true };
    }
  }

  if (
    (!checked.ok && checked.status === 401) ||
    (!users.ok && users.status === 401) ||
    me.status === 401
  ) {
    return {
      ok: false,
      status: 401,
      message: "Your Sanity session expired. Sign in again at /admin.",
    };
  }

  return {
    ok: false,
    status: 403,
    message:
      "Only a Sanity administrator can invite website editors. Editors cannot manage team access.",
  };
}

export async function listSanityMembers(token: string): Promise<SanityMember[]> {
  const result = await sanityAccessFetch<{
    data?: Array<{
      sanityUserId: string;
      profile?: {
        displayName?: string;
        email?: string;
        isCurrentUser?: boolean;
      };
      memberships?: Array<{ roleNames?: string[] }>;
    }>;
  }>(token, "/users?limit=100");

  if (!result.ok) {
    throw Object.assign(new Error(result.message), { status: result.status });
  }

  return (result.data.data ?? [])
    .map((user) => ({
      id: user.sanityUserId,
      name: user.profile?.displayName ?? "Unknown",
      email: user.profile?.email ?? "",
      roles: user.memberships?.flatMap((m) => m.roleNames ?? []) ?? [],
      isCurrentUser: Boolean(user.profile?.isCurrentUser),
    }))
    .filter((user) => user.email);
}

export async function listSanityInvites(token: string): Promise<SanityInvite[]> {
  const result = await sanityAccessFetch<{
    data?: Array<{
      id: string;
      email?: string;
      role?: string;
      status?: string;
      createdAt?: string;
    }>;
  }>(token, "/invites?status=pending&limit=100");

  if (!result.ok) {
    if (result.status === 404) return [];
    throw Object.assign(new Error(result.message), { status: result.status });
  }

  return (result.data.data ?? []).map((invite) => ({
    id: invite.id,
    email: invite.email ?? "",
    role: invite.role ?? EDITOR_INVITE_ROLE,
    status: invite.status ?? "pending",
    createdAt: invite.createdAt ?? "",
  }));
}

export async function inviteSanityEditor(
  token: string,
  email: string
): Promise<SanityInvite> {
  const created = await sanityAccessFetch<{
    id: string;
    email?: string;
    role?: string;
    status?: string;
    createdAt?: string;
  }>(token, "/invites", {
    method: "POST",
    body: JSON.stringify({ email, role: EDITOR_INVITE_ROLE }),
  });

  if (created.ok) {
    return {
      id: created.data.id,
      email: created.data.email ?? email,
      role: created.data.role ?? EDITOR_INVITE_ROLE,
      status: created.data.status ?? "pending",
      createdAt: created.data.createdAt ?? new Date().toISOString(),
    };
  }

  const legacy = await fetch(
    `${LEGACY_API}/invitations/project/${projectId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, role: EDITOR_INVITE_ROLE }),
      cache: "no-store",
    }
  );

  if (legacy.ok) {
    const body = (await legacy.json()) as {
      id?: string;
      email?: string;
      role?: string;
    };
    return {
      id: body.id ?? email,
      email: body.email ?? email,
      role: body.role ?? EDITOR_INVITE_ROLE,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  const message = created.message || (await readErrorMessage(legacy));
  const lower = message.toLowerCase();
  if (lower.includes("role") && (lower.includes("not") || lower.includes("invalid"))) {
    throw Object.assign(
      new Error(
        "Sanity could not assign the Editor role. On the free plan, only Administrator and Viewer exist — upgrade the project to Growth (or invite from sanity.io/manage) so this person can edit without becoming an admin."
      ),
      { status: 400 }
    );
  }

  throw Object.assign(new Error(message), {
    status: created.status || legacy.status,
  });
}
