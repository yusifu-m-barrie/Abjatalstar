import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PartnerServices from "@/components/PartnerServices";
import ServicesSection from "@/components/ServicesSection";
import { getServicesPage, getServices, getPartners } from "@/lib/content";

export function generateMetadata(): Metadata {
  const page = getServicesPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default function ServicesPage() {
  const page = getServicesPage();
  const services = getServices();
  const partners = getPartners();

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
