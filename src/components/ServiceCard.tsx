"use client";

import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
  href?: string;
  variant?: "default" | "partner" | "compact";
  color?: string;
  bgColor?: string;
  index?: number;
}

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  features,
  href,
  variant = "default",
  color = "text-brand-green",
  bgColor = "bg-emerald-50",
  index = 0,
}: ServiceCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-300 card-shadow hover:card-shadow-hover",
        variant === "partner" && "text-center items-center",
        variant === "compact" && "p-5"
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          bgColor,
          variant === "partner" && "mx-auto h-14 w-14 rounded-2xl"
        )}
      >
        <Icon className={cn("h-6 w-6", color, variant === "partner" && "h-7 w-7")} />
      </div>

      <h3 className="text-lg font-semibold text-brand-blue">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>

      {features && features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-muted"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {href && (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-green transition-colors group-hover:text-brand-green-light">
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}
