"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Send, ArrowDownToLine } from "lucide-react";
import type { StepItem } from "@/lib/content";
import { getIcon } from "@/lib/icons";

interface SectionContent {
  eyebrow: string;
  title: string;
  description: string;
  sendingTitle?: string;
  receivingTitle?: string;
  compact?: boolean;
  linkText?: string;
}

interface HowItWorksProps {
  section: SectionContent;
  sendingSteps: StepItem[];
  receivingSteps: StepItem[];
  showHeading?: boolean;
  compact?: boolean;
}

export default function HowItWorks({
  section,
  sendingSteps,
  receivingSteps,
  showHeading = true,
  compact,
}: HowItWorksProps) {
  const isCompact = compact ?? section.compact;

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

        <div className={isCompact ? "space-y-12" : "grid gap-12 lg:grid-cols-2 lg:gap-16"}>
          <ProcessFlow
            title={section.sendingTitle ?? "Sending Money"}
            icon={Send}
            steps={sendingSteps}
            accentColor="bg-brand-blue"
          />
          <ProcessFlow
            title={section.receivingTitle ?? "Receiving Money"}
            icon={ArrowDownToLine}
            steps={receivingSteps}
            accentColor="bg-brand-green"
          />
        </div>

        {isCompact && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link
              href="/how-it-works"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-green"
            >
              {section.linkText ?? "Learn more about our process"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ProcessFlow({
  title,
  icon: HeaderIcon,
  steps,
  accentColor,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  steps: StepItem[];
  accentColor: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-section-alt p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentColor} text-white`}>
          <HeaderIcon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-brand-blue">{title}</h3>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const StepIcon = getIcon(step.icon);
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-5 top-12 h-[calc(100%-8px)] w-px bg-border" />
              )}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-blue ring-2 ring-brand-blue/10">
                {step.number}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <StepIcon className="h-4 w-4 text-brand-green" />
                  <h4 className="font-semibold text-brand-blue">{step.title}</h4>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
