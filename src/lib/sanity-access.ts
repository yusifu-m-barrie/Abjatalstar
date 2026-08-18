import { projectId } from "../../sanity/env";

export const EDITOR_INVITE_ROLE = "editor";

const ACCESS_API = "https://api.sanity.io/v2025-07-11";
const LEGACY_API = "https://api.sanity.io/v2021-06-07";

export type SanityRole = {
  name: string;
  title: string;
  description?: string;
  canEditWebsite: boolean;
  isFullAdmin: boolean;
};

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

function getManagementToken(): string | undefined {
  const token =
    process.env.SANITY_MANAGEMENT_TOKEN?.trim() ||
    process.env.SANITY_API_TOKEN?.trim();
  return token || undefined;
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

export function isWebsiteEditorRole(role: string): boolean {
  return role === "editor" || role === "staffEditor" || role === "contributor";
}

export function roleMeta(name: string, title?: string, description?: string): SanityRole {
  const isFullAdmin = name === "administrator" || name === "admin" || name === "mainAdmin";
  const canEditWebsite =
    isFullAdmin ||
    name === "editor" ||
    name === "staffEditor" ||
    name === "contributor" ||
    name === "developer";

  return {
    name,
    title: title ?? name,
    description,
    canEditWebsite,
    isFullAdmin,
  };
}

export async function listSanityRoles(token: string): Promise<SanityRole[]> {
  const result = await sanityAccessFetch<{
    data?: Array<{
      name?: string;
      title?: string;
      description?: string;
      appliesToUsers?: boolean;
    }>;
  }>(token, "/roles?limit=100");

  if (result.ok) {
    return (result.data.data ?? [])
      .filter((role) => role.appliesToUsers !== false && role.name)
      .map((role) => roleMeta(role.name!, role.title, role.description));
  }

  // Free plan fallback when roles endpoint is unavailable.
  return [
    roleMeta(
      "administrator",
      "Administrator",
      "Full project access including members, tokens, and all content."
    ),
    roleMeta("viewer", "Viewer", "Read-only access. Cannot edit or publish website content."),
  ];
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
      profile?: { isCurrentUser?: boolean; email?: string };
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

export async function requireAdminEmail(
  adminEmail: string,
  token: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const normalized = adminEmail.trim().toLowerCase();
  if (!normalized) {
    return {
      ok: false,
      status: 401,
      message: "Sign in to Sanity Studio as an administrator first.",
    };
  }

  const members = await listSanityMembers(token);
  const match = members.find(
    (member) => member.email.toLowerCase() === normalized
  );

  if (!match || !isAdminRoleList(match.roles)) {
    return {
      ok: false,
      status: 403,
      message: "Only a Sanity administrator can invite members.",
    };
  }

  return { ok: true };
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

function formatInviteError(message: string, availableRoles: SanityRole[]): Error {
  const lower = message.toLowerCase();
  const hasEditor = availableRoles.some((role) => role.name === "editor");

  if (!hasEditor) {
    return Object.assign(
      new Error(
        "Your Sanity project is on the Free plan, which only includes Administrator and Viewer roles — not Editor. Upgrade to Growth ($15/seat/month) to invite website editors without full admin access, or invite as Administrator knowing they will have full Sanity project access."
      ),
      { status: 400 }
    );
  }

  if (lower.includes("role") && (lower.includes("not") || lower.includes("invalid"))) {
    return Object.assign(
      new Error(
        "Sanity could not assign the Editor role for this project. Check available roles in sanity.io/manage → Members."
      ),
      { status: 400 }
    );
  }

  return Object.assign(new Error(message), { status: 400 });
}

export async function inviteSanityMember(
  token: string,
  email: string,
  role: string,
  availableRoles: SanityRole[]
): Promise<SanityInvite> {
  const allowed = availableRoles.some((entry) => entry.name === role);
  if (!allowed) {
    throw formatInviteError(`Role "${role}" is not available on this project.`, availableRoles);
  }

  const created = await sanityAccessFetch<{
    id: string;
    email?: string;
    role?: string;
    status?: string;
    createdAt?: string;
  }>(token, "/invites", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });

  if (created.ok) {
    return {
      id: created.data.id,
      email: created.data.email ?? email,
      role: created.data.role ?? role,
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
      body: JSON.stringify({ email, role }),
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
      role: body.role ?? role,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  throw formatInviteError(
    created.message || (await readErrorMessage(legacy)),
    availableRoles
  );
}

export async function inviteSanityEditor(
  token: string,
  email: string
): Promise<SanityInvite> {
  const roles = await listSanityRoles(token);
  const preferred =
    roles.find((role) => role.name === EDITOR_INVITE_ROLE) ??
    roles.find((role) => isWebsiteEditorRole(role.name) && !role.isFullAdmin);

  if (!preferred) {
    throw formatInviteError("Editor role is not available on this Sanity plan.", roles);
  }

  return inviteSanityMember(token, email, preferred.name, roles);
}

export function getSanityManagementToken(): string | undefined {
  return getManagementToken();
}

export async function resolveInviteAccessToken(options: {
  sessionToken?: string | null;
  adminEmail?: string | null;
}): Promise<
  | { ok: true; token: string; via: "session" | "management" }
  | { ok: false; status: number; message: string }
> {
  const managementToken = getManagementToken();

  if (options.sessionToken) {
    const auth = await requireSanityAdmin(options.sessionToken);
    if (auth.ok) {
      return { ok: true, token: options.sessionToken, via: "session" };
    }
  }

  if (managementToken && options.adminEmail) {
    const auth = await requireAdminEmail(options.adminEmail, managementToken);
    if (auth.ok) {
      return { ok: true, token: managementToken, via: "management" };
    }
    return auth;
  }

  return {
    ok: false,
    status: 401,
    message:
      "Could not authorize member invites. Sign in as a Sanity administrator in Studio, and add SANITY_MANAGEMENT_TOKEN on Vercel (sanity.io/manage → API → Tokens → Administrator).",
  };
}
