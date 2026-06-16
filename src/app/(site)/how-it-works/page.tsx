import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import HowItWorks from "@/components/HowItWorks";
import { getHowItWorksPage, getHowItWorksSteps } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHowItWorksPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function HowItWorksPage() {
  const page = await getHowItWorksPage();
  const steps = await getHowItWorksSteps();

  return (
    <>
      <PageHeader
        badge={page.header.badge}
        title={page.header.title}
        subtitle={page.header.subtitle}
      />
      <HowItWorks
        section={page.section}
        sendingSteps={steps.sending}
        receivingSteps={steps.receiving}
        showHeading={false}
      />

      <section className="section-padding bg-section-alt">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 text-center card-shadow">
            <h2 className="text-2xl font-bold text-brand-blue">{page.cta.title}</h2>
            <p className="mt-3 text-muted">{page.cta.description}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/branches"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-blue-light"
              >
                <MapPin className="h-4 w-4" />
                {page.cta.primaryButton}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-brand-green px-6 py-3 text-sm font-semibold text-brand-green transition-all hover:bg-brand-green hover:text-white"
              >
                {page.cta.secondaryButton}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
