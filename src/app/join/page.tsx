import type { Metadata } from "next";
import JoinCmsClient from "@/components/sanity/JoinCmsClient";

export const metadata: Metadata = {
  title: "Open CMS | Abjatal Star",
  description: "Sign in to the Abjatal Star content manager with Google.",
  robots: { index: false, follow: false },
};

export default function JoinCmsPage() {
  return <JoinCmsClient />;
}
