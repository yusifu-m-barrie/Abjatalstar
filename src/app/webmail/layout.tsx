import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webmail",
  robots: { index: false, follow: false },
};

export default function WebmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
