export type EmailAccountStatus = "active" | "inactive";

export interface EmailAccount {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: EmailAccountStatus;
  createdAt: string;
  notes: string;
}

export type EmailAccountInput = Omit<EmailAccount, "id" | "createdAt">;

export type EmailAccountUpdate = Partial<EmailAccountInput>;
