"use client";

import { motion } from "framer-motion";
import type { PartnerItem } from "@/lib/content";
import { getIcon } from "@/lib/icons";
import ServiceCard from "./ServiceCard";

interface SectionContent {
  eyebrow: string;
  title: string;
  description: string;
}

interface PartnerServicesProps {
  section: SectionContent;
  partners: PartnerItem[];
  showHeading?: boolean;
  limit?: number;
}

export default function PartnerServices({
  section,
  partners,
  showHeading = true,
  limit,
}: PartnerServicesProps) {
  const items = limit ? partners.slice(0, limit) : partners;

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              {section.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-blue sm:text-4xl">
              {section.title}
            </h2>
            <p className="mt-4 text-muted">{section.description}</p>
          </motion.div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((partner, index) => (
            <ServiceCard
              key={partner.id}
              title={partner.name}
              description={partner.description}
              icon={getIcon(partner.icon)}
              variant="partner"
              color={partner.color}
              bgColor={partner.bgColor}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
