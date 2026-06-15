"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone, Star } from "lucide-react";
import type { BranchItem } from "@/lib/content";
import { cn } from "@/lib/utils";

interface BranchCardProps {
  branch: BranchItem;
  index?: number;
}

export default function BranchCard({ branch, index = 0 }: BranchCardProps) {
  return (
    <motion.article
      id={branch.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-300 card-shadow hover:card-shadow-hover",
        branch.isMain && "ring-2 ring-brand-green/20"
      )}
    >
      {branch.isMain && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white">
          <Star className="h-3 w-3 fill-current" />
          Main Branch
        </div>
      )}

      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-orange">
        {branch.city}
      </div>
      <h3 className="text-xl font-bold text-brand-blue">{branch.name}</h3>

      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
          <p className="text-sm leading-relaxed text-muted">{branch.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 shrink-0 text-brand-green" />
          <a
            href={`tel:${branch.phone.replace(/\s/g, "")}`}
            className="text-sm text-muted transition-colors hover:text-brand-blue"
          >
            {branch.phone}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 shrink-0 text-brand-green" />
          <a
            href={`mailto:${branch.email}`}
            className="text-sm text-muted transition-colors hover:text-brand-blue"
          >
            {branch.email}
          </a>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
          <div className="text-sm text-muted">
            <p>{branch.hours.weekdays}</p>
            <p>{branch.hours.saturday}</p>
            <p>{branch.hours.sunday}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-blue">
          Available Services
        </p>
        <div className="flex flex-wrap gap-2">
          {branch.services.map((service) => (
            <span
              key={service}
              className="rounded-full bg-section-alt px-3 py-1 text-xs font-medium text-brand-blue-light"
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
