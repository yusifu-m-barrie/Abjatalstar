import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Content Manager",
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="admin-root">{children}</div>;
}
