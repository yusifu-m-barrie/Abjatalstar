"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import type { BranchItem } from "@/lib/content";
import BranchCard from "./BranchCard";

interface SectionContent {
  eyebrow: string;
  title: string;
  description: string;
  limit?: number;
  showViewAll?: boolean;
  viewAllText?: string;
  bannerText?: string;
}

interface BranchesSectionProps {
  section: SectionContent;
  branches: BranchItem[];
  showHeading?: boolean;
  showViewAll?: boolean;
  limit?: number;
}

export default function BranchesSection({
  section,
  branches,
  showHeading = true,
  showViewAll,
  limit,
}: BranchesSectionProps) {
  const effectiveLimit = limit ?? section.limit;
  const items = effectiveLimit ? branches.slice(0, effectiveLimit) : branches;
  const shouldShowViewAll = showViewAll ?? section.showViewAll;

  return (
    <section className="section-padding bg-section-alt" id="branches">
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

        <div className="mb-8 flex items-center justify-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-3 text-sm text-brand-green">
          <MapPin className="h-4 w-4" />
          <span>
            <strong>{branches.length} branches</strong> {section.bannerText}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((branch, index) => (
            <BranchCard key={branch.id} branch={branch} index={index} />
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
              href="/branches"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-green-light"
            >
              {section.viewAllText ?? "View All Branches"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
