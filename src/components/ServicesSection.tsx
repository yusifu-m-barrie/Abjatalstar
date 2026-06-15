"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ServiceItem } from "@/lib/content";
import { getIcon } from "@/lib/icons";
import ServiceCard from "./ServiceCard";

interface SectionContent {
  eyebrow: string;
  title: string;
  description: string;
  limit?: number;
  showViewAll?: boolean;
  viewAllText?: string;
}

interface ServicesSectionProps {
  section: SectionContent;
  services: ServiceItem[];
  showHeading?: boolean;
  showViewAll?: boolean;
  limit?: number;
}

export default function ServicesSection({
  section,
  services,
  showHeading = true,
  showViewAll,
  limit,
}: ServicesSectionProps) {
  const effectiveLimit = limit ?? section.limit;
  const items = effectiveLimit ? services.slice(0, effectiveLimit) : services;
  const shouldShowViewAll = showViewAll ?? section.showViewAll;

  return (
    <section className="section-padding bg-section-alt">
      <div className="container-custom">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-green">
              {section.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-blue sm:text-4xl">
              {section.title}
            </h2>
            <p className="mt-4 text-muted">{section.description}</p>
          </motion.div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((service, index) => (
            <div key={service.id} id={service.id}>
              <ServiceCard
                title={service.title}
                description={service.description}
                icon={getIcon(service.icon)}
                features={service.features}
                index={index}
              />
            </div>
          ))}
        </div>

        {shouldShowViewAll && effectiveLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-blue-light"
            >
              {section.viewAllText ?? "View All Services"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
