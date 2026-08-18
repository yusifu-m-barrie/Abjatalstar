"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useClient, useProjectId } from "sanity";
import { apiVersion } from "../../../sanity/env";

type Member = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isCurrentUser: boolean;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type TeamResponse = {
  members?: Member[];
  invites?: Invite[];
  manageUrl?: string;
  siteUrl?: string;
  error?: string;
};

const EDITOR_ROLE = "editor";
const ACCESS_API_VERSION = "2025-07-11";

function parseTokenValue(raw: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { token?: string; accessToken?: string } | string;
    if (typeof parsed === "string" && parsed.length > 20) return parsed;
    if (parsed && typeof parsed === "object") {
      return parsed.token || parsed.accessToken;
    }
  } catch {
    if (raw.length > 20 && !raw.startsWith("{")) return raw;
  }
  return undefined;
}

async function resolveStudioToken(
  client: ReturnType<typeof useClient>,
  projectId: string
): Promise<string | undefined> {
  const configured = client.config().token as unknown;
  if (typeof configured === "string" && configured) return configured;
  if (typeof configured === "function") {
    try {
      const value = await (configured as () => Promise<string> | string)();
      if (typeof value === "string" && value) return value;
    } catch {
      // fall through to storage
    }
  }

  if (typeof window === "undefined") return undefined;

  const preferredKeys = [
    `__studio_auth_token_${projectId}`,
    `__sanity_auth_token_${projectId}`,
    "__studio_auth_token",
    "__sanity_auth_token",
  ];

  const storages = [window.sessionStorage, window.localStorage];
  try {
    for (const storage of storages) {
      for (const key of preferredKeys) {
        const token = parseTokenValue(storage.getItem(key));
        if (token) return token;
      }

      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (!key) continue;
        const lower = key.toLowerCase();
        if (!lower.includes("token") && !lower.includes("auth")) continue;
        const token = parseTokenValue(storage.getItem(key));
        if (token) return token;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function roleLabel(roles: string[]): string {
  if (roles.some((role) => role === "administrator" || role === "admin" || role === "mainAdmin")) {
    return "Administrator";
  }
  if (roles.some((role) => role === "editor" || role === "staffEditor")) {
    return "Editor";
  }
  if (roles.includes("contributor")) return "Contributor";
  if (roles.includes("viewer")) return "Viewer";
  if (roles.includes("developer")) return "Developer";
  return roles[0] ?? "Member";
}

function requestErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const record = error as {
      message?: string;
      statusCode?: number;
      status?: number;
      response?: { body?: { message?: string; error?: string } };
    };
    const fromBody =
      record.response?.body?.message || record.response?.body?.error;
    if (fromBody) return fromBody;
    if (record.message) return record.message;
  }
  if (error instanceof Error) return error.message;
  return "Sanity request failed.";
}

export default function InviteEditorTool() {
  const client = useClient({ apiVersion });
  const projectId = useProjectId();
  const accessClient = useMemo(
    () =>
      client.withConfig({
        apiVersion: ACCESS_API_VERSION,
        useCdn: false,
        useProjectHostname: false,
        withCredentials: true,
      }),
    [client]
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [manageUrl, setManageUrl] = useState(
    projectId
      ? `https://www.sanity.io/manage/project/${projectId}/members`
      : "https://www.sanity.io/manage"
  );
  const [siteUrl, setSiteUrl] = useState("https://www.abjatalstar.com");

  const sanityRequest = useCallback(
    async <T,>(path: string, method: string, body?: unknown): Promise<T> => {
      return accessClient.request<T>({
        uri: `/access/project/${projectId}${path}`,
        method,
        body,
      });
    },
    [accessClient, projectId]
  );

  const loadViaSanityClient = useCallback(async (): Promise<boolean> => {
    const [usersRes, invitesRes] = await Promise.allSettled([
      sanityRequest<{
        data?: Array<{
          sanityUserId: string;
          profile?: {
            displayName?: string;
            email?: string;
            isCurrentUser?: boolean;
          };
          memberships?: Array<{ roleNames?: string[] }>;
        }>;
      }>("/users?limit=100", "GET"),
      sanityRequest<{
        data?: Array<{
          id: string;
          email?: string;
          role?: string;
          status?: string;
          createdAt?: string;
        }>;
      }>("/invites?status=pending&limit=100", "GET"),
    ]);

    if (usersRes.status !== "fulfilled") return false;

    setMembers(
      (usersRes.value.data ?? [])
        .map((user) => ({
          id: user.sanityUserId,
          name: user.profile?.displayName ?? "Unknown",
          email: user.profile?.email ?? "",
          roles: user.memberships?.flatMap((m) => m.roleNames ?? []) ?? [],
          isCurrentUser: Boolean(user.profile?.isCurrentUser),
        }))
        .filter((user) => user.email)
    );

    if (invitesRes.status === "fulfilled") {
      setInvites(
        (invitesRes.value.data ?? []).map((invite) => ({
          id: invite.id,
          email: invite.email ?? "",
          role: invite.role ?? EDITOR_ROLE,
          status: invite.status ?? "pending",
          createdAt: invite.createdAt ?? "",
        }))
      );
    } else {
      setInvites([]);
    }

    return true;
  }, [sanityRequest]);

  const loadViaApi = useCallback(async (): Promise<boolean> => {
    const token = await resolveStudioToken(client, projectId);
    if (!token) return false;

    const response = await fetch("/api/admin/invite-editor", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await response.json()) as TeamResponse;
    if (!response.ok) {
      throw new Error(data.error ?? "Could not load team members.");
    }
    setMembers(data.members ?? []);
    setInvites(data.invites ?? []);
    if (data.manageUrl) setManageUrl(data.manageUrl);
    if (data.siteUrl) setSiteUrl(data.siteUrl);
    return true;
  }, [client, projectId]);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (await loadViaSanityClient()) return;
      if (await loadViaApi()) return;
      setError(
        "Could not load Sanity members from this session. You can still send the invite below, or invite from sanity.io/manage → Members → Invite (role: Editor)."
      );
    } catch (loadError) {
      setError(requestErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [loadViaApi, loadViaSanityClient]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const inviteViaSanityClient = async (editorEmail: string) => {
    return sanityRequest<{
      id?: string;
      email?: string;
      role?: string;
      status?: string;
    }>("/invites", "POST", {
      email: editorEmail,
      role: EDITOR_ROLE,
    });
  };

  const inviteViaLegacyApi = async (editorEmail: string) => {
    return accessClient.request<{ id?: string; email?: string; role?: string }>({
      uri: `/invitations/project/${projectId}`,
      method: "POST",
      body: { email: editorEmail, role: EDITOR_ROLE },
    });
  };

  const inviteViaAppApi = async (editorEmail: string) => {
    const token = await resolveStudioToken(client, projectId);
    if (!token) return null;
    const response = await fetch("/api/admin/invite-editor", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: editorEmail }),
    });
    const data = (await response.json()) as { error?: string; message?: string };
    if (!response.ok) {
      throw new Error(data.error ?? "Could not send the invitation.");
    }
    return data;
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    const editorEmail = email.trim().toLowerCase();
    if (!editorEmail) return;

    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      try {
        await inviteViaSanityClient(editorEmail);
      } catch (firstError) {
        const firstMessage = requestErrorMessage(firstError);
        try {
          await inviteViaLegacyApi(editorEmail);
        } catch (secondError) {
          const apiResult = await inviteViaAppApi(editorEmail);
          if (!apiResult) {
            throw new Error(firstMessage || requestErrorMessage(secondError));
          }
        }
      }

      setSuccess(
        `Invitation sent to ${editorEmail} as Editor. They should accept the Sanity email, then sign in at ${siteUrl.replace(/\/$/, "")}/admin.`
      );
      setEmail("");
      await loadTeam();
    } catch (inviteError) {
      const message = requestErrorMessage(inviteError);
      const lower = message.toLowerCase();
      if (lower.includes("role") && (lower.includes("not") || lower.includes("invalid"))) {
        setError(
          "Sanity could not assign the Editor role. On the free plan, only Administrator and Viewer exist. Invite from sanity.io/manage, or upgrade the project so Editor is available."
        );
      } else {
        setError(message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2.5rem 1.5rem 4rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px", letterSpacing: "0.04em" }}>
        ABJATAL STAR CMS
      </p>
      <h1 style={{ fontSize: 28, margin: "0 0 12px", fontWeight: 700 }}>
        Invite a website editor
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, margin: "0 0 24px" }}>
        Send a Sanity invite with the <strong>Editor</strong> role — not Administrator.
        That person can update content on{" "}
        <a href={siteUrl} target="_blank" rel="noreferrer">
          {siteUrl.replace(/^https?:\/\//, "")}
        </a>{" "}
        from <code>/admin</code>. They cannot manage members, tokens, or project settings.
      </p>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 20,
          marginBottom: 28,
          background: "#fff",
        }}
      >
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>What an editor can do</h2>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
          <li>Edit homepage, services, branches, agents, about, contact, and site settings</li>
          <li>Publish updates so they appear on the live website</li>
          <li>Cannot delete documents, invite other people, or access email-account records</li>
        </ul>
      </div>

      <form
        onSubmit={handleInvite}
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 20,
          marginBottom: 28,
          background: "#fff",
        }}
      >
        <label htmlFor="editor-email" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
          Editor email
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            id="editor-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="editor@abjatalstar.com"
            style={{
              flex: "1 1 240px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              background: "#1a237e",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: sending ? "wait" : "pointer",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? "Sending…" : "Invite as Editor"}
          </button>
        </div>
        <p style={{ color: "#64748b", fontSize: 13, margin: "10px 0 0" }}>
          Sanity emails them a link. After they accept, they sign in at{" "}
          <a href="/admin">{siteUrl.replace(/\/$/, "")}/admin</a>.
        </p>
      </form>

      {error ? (
        <p
          role="alert"
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 20,
          }}
        >
          {error}{" "}
          <a href={manageUrl} target="_blank" rel="noreferrer">
            Open Sanity Members
          </a>
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          style={{
            background: "#ecfdf5",
            color: "#047857",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 20,
          }}
        >
          {success}
        </p>
      ) : null}

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading team…</p>
      ) : (
        <>
          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Pending invitations</h2>
          {invites.length === 0 ? (
            <p style={{ color: "#64748b", marginTop: 0 }}>No pending invites.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{invite.email || "Unknown email"}</span>
                  <span style={{ color: "#64748b" }}>
                    {invite.role} · {invite.status}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Project members</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {members.map((member) => (
              <li
                key={member.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <span>
                  {member.name}
                  {member.isCurrentUser ? " (you)" : ""}
                  <br />
                  <span style={{ color: "#64748b", fontSize: 13 }}>{member.email}</span>
                </span>
                <span style={{ fontWeight: 600 }}>{roleLabel(member.roles)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
