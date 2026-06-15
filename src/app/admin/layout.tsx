import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Manager",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
