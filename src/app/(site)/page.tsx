import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import PartnerServices from "@/components/PartnerServices";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import BranchesSection from "@/components/BranchesSection";
import HowItWorks from "@/components/HowItWorks";
import ContactSection from "@/components/ContactSection";
import {
  getHomePage,
  getServices,
  getPartners,
  getBranches,
  getWhyChooseUs,
  getHowItWorksSteps,
  getContactPage,
  getSiteSettings,
} from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const [home, site] = await Promise.all([getHomePage(), getSiteSettings()]);

  return {
    title: home.seo?.title ?? site.seo?.title ?? `${site.name} | Remittance & Orange Money`,
    description:
      home.seo?.description ?? site.seo?.description ?? site.description,
  };
}

export default async function HomePage() {
  const home = await getHomePage();
  const services = await getServices();
  const partners = await getPartners();
  const branches = await getBranches();
  const whyChooseUs = await getWhyChooseUs();
  const steps = await getHowItWorksSteps();
  const contact = await getContactPage();

  return (
    <>
      <HeroSection content={home.hero} trustBadges={home.trustBadges} />
      <PartnerServices section={home.partners} partners={partners} />
      <ServicesSection section={home.services} services={services} />
      <WhyChooseUs section={home.whyChooseUs} items={whyChooseUs} />
      <BranchesSection section={home.branches} branches={branches} />
      <HowItWorks
        section={home.howItWorks}
        sendingSteps={steps.sending}
        receivingSteps={steps.receiving}
      />
      <ContactSection
        section={contact.section}
        serviceOptions={contact.serviceOptions}
      />
    </>
  );
}
