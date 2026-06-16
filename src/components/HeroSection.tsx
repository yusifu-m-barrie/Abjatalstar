"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Shield, Globe, TrendingUp } from "lucide-react";
import type { HomePageContent } from "@/lib/content";
import { useBusiness } from "@/context/SiteSettingsContext";
import TrustBadges from "./TrustBadges";

interface HeroSectionProps {
  content: HomePageContent["hero"];
  trustBadges: HomePageContent["trustBadges"];
}

export default function HeroSection({ content, trustBadges }: HeroSectionProps) {
  const business = useBusiness();
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-purple/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-orange/5 blur-3xl" />

      <div className="section-padding container-custom relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-sm font-medium text-brand-blue"
            >
              <Shield className="h-4 w-4" />
              {content.badge}
            </motion.div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-brand-blue sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              {content.title}{" "}
              <span className="gradient-text">{content.titleHighlight}</span>{" "}
              {content.titleSuffix}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {business.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/branches"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-blue-light hover:shadow-lg hover:shadow-brand-blue/25"
              >
                <MapPin className="h-4 w-4" />
                {content.primaryButton}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-green px-7 py-3.5 text-sm font-semibold text-brand-green transition-all hover:bg-brand-green hover:text-white"
              >
                {content.secondaryButton}
              </Link>
            </div>

            <div className="mt-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
                {content.trustLabel}
              </p>
              <TrustBadges badges={trustBadges} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-green opacity-10 blur-2xl" />
              <div className="relative rounded-3xl border border-border bg-white p-8 card-shadow">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">{content.statsCard.label}</p>
                    <p className="text-3xl font-bold text-brand-blue">{content.statsCard.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
                    <TrendingUp className="h-6 w-6 text-brand-green" />
                  </div>
                </div>

                <div className="space-y-4">
                  {content.statsCard.transactions.map((tx, i) => (
                    <motion.div
                      key={tx.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex items-center justify-between rounded-xl bg-section-alt p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                          <Globe className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-blue">{tx.label}</p>
                          <p className="text-xs text-muted">{tx.amount}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-medium text-brand-green">
                        {tx.status}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-brand-blue p-4 text-white">
                  <Shield className="h-8 w-8 shrink-0 text-brand-green-light" />
                  <div>
                    <p className="text-sm font-semibold">{content.statsCard.securityTitle}</p>
                    <p className="text-xs text-blue-200">{content.statsCard.securityText}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
