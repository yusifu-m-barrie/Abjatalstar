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
} from "@/lib/content";

export default function HomePage() {
  const home = getHomePage();
  const services = getServices();
  const partners = getPartners();
  const branches = getBranches();
  const whyChooseUs = getWhyChooseUs();
  const steps = getHowItWorksSteps();
  const contact = getContactPage();

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
