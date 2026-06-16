import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";
import { getContactPage } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function ContactPage() {
  const page = await getContactPage();

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
