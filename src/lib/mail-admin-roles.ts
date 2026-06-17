export type MailAdminRole = "super_admin" | "admin" | "editor";

export type MailPermission =
  | "read_accounts"
  | "write_accounts"
  | "delete_accounts"
  | "view_activity"
  | "manage_cpanel_settings";

const ROLE_PERMISSIONS: Record<MailAdminRole, MailPermission[]> = {
  super_admin: [
    "read_accounts",
    "write_accounts",
    "delete_accounts",
    "view_activity",
    "manage_cpanel_settings",
  ],
  admin: ["read_accounts", "write_accounts", "delete_accounts", "view_activity"],
  editor: ["read_accounts"],
};

export function hasMailPermission(
  role: MailAdminRole,
  permission: MailPermission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getRoleLabel(role: MailAdminRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "editor":
      return "Staff / Editor";
  }
}

export interface MailAdminCredential {
  email: string;
  password: string;
  role: MailAdminRole;
}

export function getConfiguredMailAdmins(): MailAdminCredential[] {
  const admins: MailAdminCredential[] = [];

  if (process.env.MAIL_SUPER_ADMIN_PASSWORD) {
    admins.push({
      email: (
        process.env.MAIL_SUPER_ADMIN_EMAIL ?? "super@abjatalstar.com"
      ).toLowerCase(),
      password: process.env.MAIL_SUPER_ADMIN_PASSWORD,
      role: "super_admin",
    });
  }

  if (process.env.MAIL_ADMIN_PASSWORD) {
    admins.push({
      email: (process.env.MAIL_ADMIN_EMAIL ?? "admin@abjatalstar.com").toLowerCase(),
      password: process.env.MAIL_ADMIN_PASSWORD,
      role: "admin",
    });
  }

  if (process.env.MAIL_EDITOR_PASSWORD) {
    admins.push({
      email: (process.env.MAIL_EDITOR_EMAIL ?? "editor@abjatalstar.com").toLowerCase(),
      password: process.env.MAIL_EDITOR_PASSWORD,
      role: "editor",
    });
  }

  return admins;
}

export function authenticateMailAdmin(
  email: string,
  password: string
): { email: string; role: MailAdminRole } | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const match = getConfiguredMailAdmins().find(
    (admin) => admin.email === normalizedEmail && admin.password === password
  );

  if (!match) return null;
  return { email: match.email, role: match.role };
}
