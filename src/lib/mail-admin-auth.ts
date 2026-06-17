import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  type MailAdminRole,
  type MailPermission,
  hasMailPermission,
} from "@/lib/mail-admin-roles";

const COOKIE_NAME = "mail_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export interface MailAdminSession {
  email: string;
  role: MailAdminRole;
}

function getSessionSecret(): string {
  const secret =
    process.env.MAIL_SESSION_SECRET ||
    process.env.MAIL_SUPER_ADMIN_PASSWORD ||
    process.env.MAIL_ADMIN_PASSWORD;

  if (!secret) {
    throw new Error(
      "Mail admin session secret is not configured. Set MAIL_SESSION_SECRET or MAIL_ADMIN_PASSWORD."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken(session: MailAdminSession): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `mail:${session.email}:${session.role}:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined
): MailAdminSession | null {
  if (!token) return null;

  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = sign(payload);
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const parts = payload.split(":");
    if (parts.length !== 4 || parts[0] !== "mail") return null;

    const email = parts[1];
    const role = parts[2] as MailAdminRole;
    const expiresAt = Number(parts[3]);

    if (!email || !role) return null;
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;
    if (!["super_admin", "admin", "editor"].includes(role)) return null;

    return { email, role };
  } catch {
    return null;
  }
}

export async function getMailAdminSession(): Promise<MailAdminSession | null> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKIE_NAME)?.value);
}

export async function isMailAdminAuthenticated(): Promise<boolean> {
  return Boolean(await getMailAdminSession());
}

export async function requireMailPermission(
  permission: MailPermission
): Promise<
  | { session: MailAdminSession; error?: undefined }
  | { session?: undefined; error: Response }
> {
  const session = await getMailAdminSession();
  if (!session) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasMailPermission(session.role, permission)) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

export function getMailAdminCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export { COOKIE_NAME as MAIL_ADMIN_COOKIE_NAME };
