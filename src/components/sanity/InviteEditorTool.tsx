"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useCurrentUser, useProjectId } from "sanity";

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

type AvailableRole = {
  name: string;
  title: string;
  description?: string;
  canEditWebsite: boolean;
  isFullAdmin: boolean;
};

type TeamResponse = {
  members?: Member[];
  invites?: Invite[];
  availableRoles?: AvailableRole[];
  canInviteEditor?: boolean;
  planNote?: string | null;
  manageUrl?: string;
  pricingUrl?: string;
  siteUrl?: string;
  recommendedRoles?: string[];
  error?: string;
};

function roleLabel(roles: string[]): string {
  if (roles.some((role) => role === "administrator" || role === "admin")) {
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
  const currentUser = useCurrentUser();
  const projectId = useProjectId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);
  const [planNote, setPlanNote] = useState<string | null>(null);
  const [canInviteEditor, setCanInviteEditor] = useState(false);
  const [manageUrl, setManageUrl] = useState(
    projectId
      ? `https://www.sanity.io/manage/project/${projectId}/members`
      : "https://www.sanity.io/manage"
  );
  const [pricingUrl, setPricingUrl] = useState("https://www.sanity.io/pricing");
  const [siteUrl, setSiteUrl] = useState("https://www.abjatalstar.com");

  const adminEmail = currentUser?.email?.trim().toLowerCase() ?? "";

  const apiHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (adminEmail) headers["X-Sanity-Admin-Email"] = adminEmail;
    return headers;
  }, [adminEmail]);

  const loadTeam = useCallback(async () => {
    if (!adminEmail) {
      setLoading(false);
      setError("Sign in to Sanity Studio as an administrator to invite members.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/invite-editor", {
        headers: apiHeaders(),
      });
      const data = (await response.json()) as TeamResponse;
      if (!response.ok) {
        setError(data.error ?? "Could not load team members.");
        return;
      }

      setMembers(data.members ?? []);
      setInvites(data.invites ?? []);
      setAvailableRoles(data.availableRoles ?? []);
      setCanInviteEditor(Boolean(data.canInviteEditor));
      setPlanNote(data.planNote ?? null);
      if (data.manageUrl) setManageUrl(data.manageUrl);
      if (data.pricingUrl) setPricingUrl(data.pricingUrl);
      if (data.siteUrl) setSiteUrl(data.siteUrl);

      const roles = data.availableRoles ?? [];
      const preferred =
        roles.find((entry) => entry.name === "editor") ??
        roles.find((entry) => entry.canEditWebsite && !entry.isFullAdmin) ??
        roles.find((entry) => entry.canEditWebsite);

      if (preferred) setRole(preferred.name);
    } catch {
      setError("Network error while loading team members.");
    } finally {
      setLoading(false);
    }
  }, [adminEmail, apiHeaders]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!adminEmail) {
      setError("Sign in to Sanity Studio as an administrator first.");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/invite-editor", {
        method: "POST",
        headers: {
          ...apiHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role, adminEmail }),
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

  const selectedRole = availableRoles.find((entry) => entry.name === role);

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
        Invite someone to update content on{" "}
        <a href={siteUrl} target="_blank" rel="noreferrer">
          {siteUrl.replace(/^https?:\/\//, "")}
        </a>{" "}
        from <code>/admin</code>.
      </p>

      {planNote ? (
        <div
          style={{
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#92400e",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          <strong>Editor role is not on your current Sanity plan.</strong>
          <p style={{ margin: "8px 0 0" }}>{planNote}</p>
          <p style={{ margin: "8px 0 0" }}>
            <a href={pricingUrl} target="_blank" rel="noreferrer">
              View Sanity pricing
            </a>{" "}
            or invite as <strong>Administrator</strong> below if you need them editing immediately
            (they will also have full Sanity project access).
          </p>
        </div>
      ) : null}

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
          <li>Cannot manage members, API tokens, or project settings (Editor role only)</li>
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
          Email
        </label>
        <input
          id="editor-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="sanunu@abjatalstar.com"
          style={{
            width: "100%",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 14,
            marginBottom: 16,
          }}
        />

        <label htmlFor="editor-role" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
          Sanity role
        </label>
        <select
          id="editor-role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          style={{
            width: "100%",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 14,
            marginBottom: 8,
            background: "#fff",
          }}
        >
          {availableRoles.length === 0 ? (
            <option value="editor">Editor</option>
          ) : (
            availableRoles.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.title}
                {entry.canEditWebsite ? "" : " (read-only)"}
              </option>
            ))
          )}
        </select>

        {selectedRole?.description ? (
          <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
            {selectedRole.description}
            {selectedRole.isFullAdmin
              ? " They will have full Sanity admin access, not just website editing."
              : null}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending || !adminEmail}
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
          {sending
            ? "Sending…"
            : canInviteEditor
              ? "Invite as Editor"
              : `Invite as ${selectedRole?.title ?? "Member"}`}
        </button>

        <p style={{ color: "#64748b", fontSize: 13, margin: "10px 0 0" }}>
          Copy the invite link from Sanity Members (not an old email). After they
          accept, they open{" "}
          <a href="/join">{siteUrl.replace(/\/$/, "")}/join</a> and sign in with
          the same Gmail. That page sends them to{" "}
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
            lineHeight: 1.5,
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
