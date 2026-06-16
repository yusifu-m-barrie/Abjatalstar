import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PartnerServices from "@/components/PartnerServices";
import ServicesSection from "@/components/ServicesSection";
import { getServicesPage, getServices, getPartners } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicesPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function ServicesPage() {
  const page = await getServicesPage();
  const services = await getServices();
  const partners = await getPartners();

  return (
    <>
      <PageHeader
        badge={page.header.badge}
        title={page.header.title}
        subtitle={page.header.subtitle}
      />
      <ServicesSection
        section={page.servicesSection}
        services={services}
        showViewAll={false}
      />
      <PartnerServices section={page.partnersSection} partners={partners} />
    </>
  );
}
