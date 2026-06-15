import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";
import { getContactPage } from "@/lib/content";

export function generateMetadata(): Metadata {
  const page = getContactPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default function ContactPage() {
  const page = getContactPage();

  return (
    <>
      <PageHeader
        badge={page.header.badge}
        title={page.header.title}
        subtitle={page.header.subtitle}
      />
      <ContactSection
        section={page.section}
        serviceOptions={page.serviceOptions}
        showHeading={false}
      />
    </>
  );
}
