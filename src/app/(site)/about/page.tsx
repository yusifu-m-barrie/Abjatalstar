import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TrustBadges from "@/components/TrustBadges";
import WhyChooseUs from "@/components/WhyChooseUs";
import { getAboutPage, getHomePage, getWhyChooseUs } from "@/lib/content";

export function generateMetadata(): Metadata {
  const page = getAboutPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default function AboutPage() {
  const page = getAboutPage();
  const home = getHomePage();
  const whyChooseUs = getWhyChooseUs();

  return (
    <>
      <PageHeader
        badge={page.header.badge}
        title={page.header.title}
        subtitle={page.header.subtitle}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-brand-blue sm:text-3xl">
                {page.whoWeAre.title}
              </h2>
              {page.whoWeAre.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4 leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light p-8 text-white">
              <h3 className="text-xl font-bold">{page.mission.title}</h3>
              <p className="mt-3 leading-relaxed text-blue-100">{page.mission.text}</p>
              <h3 className="mt-6 text-xl font-bold">{page.vision.title}</h3>
              <p className="mt-3 leading-relaxed text-blue-100">{page.vision.text}</p>
            </div>
          </div>

          {page.showTrustBadges && (
            <div className="mt-16">
              <TrustBadges badges={home.trustBadges} />
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-section-alt">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-brand-blue sm:text-3xl">
              {page.values.title}
            </h2>
            <p className="mt-4 text-muted">{page.values.description}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {page.values.items.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-white p-6 card-shadow"
              >
                <h3 className="text-lg font-semibold text-brand-blue">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {page.showWhyChooseUs && (
        <WhyChooseUs section={home.whyChooseUs} items={whyChooseUs} />
      )}
    </>
  );
}
