"use client";

import { motion } from "framer-motion";
import type { WhyChooseItem } from "@/lib/content";
import { getIcon } from "@/lib/icons";

interface SectionContent {
  eyebrow: string;
  title: string;
  description: string;
  stats: {
    customers: string;
    customersLabel: string;
    branches: string;
    branchesLabel: string;
    partners: string;
    partnersLabel: string;
    years: string;
    yearsLabel: string;
  };
}

interface WhyChooseUsProps {
  section: SectionContent;
  items: WhyChooseItem[];
}

export default function WhyChooseUs({ section, items }: WhyChooseUsProps) {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              {section.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-blue sm:text-4xl">
              {section.title}
            </h2>
            <p className="mt-4 leading-relaxed text-muted">{section.description}</p>

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light p-6 text-white">
              <p className="text-4xl font-bold">{section.stats.customers}</p>
              <p className="mt-1 text-blue-100">{section.stats.customersLabel}</p>
              <div className="mt-4 flex gap-6 border-t border-white/20 pt-4">
                <div>
                  <p className="text-2xl font-bold">{section.stats.branches}</p>
                  <p className="text-xs text-blue-200">{section.stats.branchesLabel}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{section.stats.partners}</p>
                  <p className="text-xs text-blue-200">{section.stats.partnersLabel}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{section.stats.years}</p>
                  <p className="text-xs text-blue-200">{section.stats.yearsLabel}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -2 }}
                  className="group rounded-2xl border border-border bg-white p-5 transition-all duration-300 card-shadow hover:card-shadow-hover"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 transition-colors group-hover:bg-brand-green/20">
                    <Icon className="h-5 w-5 text-brand-green" />
                  </div>
                  <h3 className="font-semibold text-brand-blue">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
