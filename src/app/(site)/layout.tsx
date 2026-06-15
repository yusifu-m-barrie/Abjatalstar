import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import ChatBot from "@/components/ChatBot";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${BUSINESS.name} | Remittance & Orange Money`,
    template: `%s | ${BUSINESS.shortName}`,
  },
  description: BUSINESS.description,
  keywords: [
    "money transfer",
    "remittance",
    "Western Union",
    "MoneyGram",
    "Orange Money",
    "Afrimoney",
    "mobile money",
    "Sierra Leone",
    "Abjatal Star",
    "Abjatal Star Enterprise",
    "FX Bureau",
  ],
  openGraph: {
    title: BUSINESS.name,
    description: BUSINESS.description,
    type: "website",
    locale: "en_US",
    images: [{ url: BUSINESS.logo, alt: BUSINESS.name }],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
      <ChatBot />
    </>
  );
}
