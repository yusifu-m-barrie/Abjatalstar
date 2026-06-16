import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import ChatBot from "@/components/ChatBot";
import { getSiteSettings } from "@/lib/content";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";

export async function generateMetadata(): Promise<Metadata> {
  const business = await getSiteSettings();

  return {
    title: {
      default: `${business.name} | Remittance & Orange Money`,
      template: `%s | ${business.shortName}`,
    },
    description: business.description,
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
      title: business.name,
      description: business.description,
      type: "website",
      locale: "en_US",
      images: [{ url: business.logo, alt: business.name }],
    },
  };
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <SiteSettingsProvider settings={settings}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
      <ChatBot />
    </SiteSettingsProvider>
  );
}
