"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useClient } from "sanity";
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

async function resolveStudioToken(
  client: ReturnType<typeof useClient>
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

  const storages = [window.sessionStorage, window.localStorage];
  try {
    for (const storage of storages) {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (!key) continue;
        const looksLikeToken =
          key.toLowerCase().includes("sanity") &&
          (key.toLowerCase().includes("token") ||
            key.toLowerCase().includes("auth"));
        if (!looksLikeToken) continue;
        const raw = storage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw) as { token?: string } | string;
          if (typeof parsed === "string" && parsed.length > 20) return parsed;
          if (parsed && typeof parsed === "object" && parsed.token) {
            return parsed.token;
          }
        } catch {
          if (raw.length > 20 && !raw.startsWith("{")) return raw;
        }
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

export default function InviteEditorTool() {
  const client = useClient({ apiVersion });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [manageUrl, setManageUrl] = useState(
    "https://www.sanity.io/manage"
  );
  const [siteUrl, setSiteUrl] = useState("https://www.abjatalstar.com");

  const loadTeam = useCallback(async () => {
    const token = await resolveStudioToken(client);
    if (!token) {
      setLoading(false);
      setError(
        "Could not read your Sanity session. Open this tool while signed in as an administrator, or invite the editor from sanity.io/manage → Members → Invite (role: Editor)."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/invite-editor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as TeamResponse;
      if (!response.ok) {
        setError(data.error ?? "Could not load team members.");
        return;
      }
      setMembers(data.members ?? []);
      setInvites(data.invites ?? []);
      if (data.manageUrl) setManageUrl(data.manageUrl);
      if (data.siteUrl) setSiteUrl(data.siteUrl);
    } catch {
      setError("Network error while loading team members.");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    const token = await resolveStudioToken(client);
    if (!token) {
      setError(
        "Could not read your Sanity session. Sign in as an administrator and try again."
      );
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/invite-editor", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not send the invitation.");
        return;
      }
      setSuccess(data.message ?? `Invitation sent to ${email}.`);
      setEmail("");
      await loadTeam();
    } catch {
      setError("Network error while sending the invitation.");
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
