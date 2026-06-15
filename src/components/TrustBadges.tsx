"use client";

import { motion } from "framer-motion";
import type { TrustBadgeItem } from "@/lib/content";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const accentMap: Record<string, string> = {
  blue: "bg-brand-blue",
  purple: "bg-brand-purple",
  red: "bg-brand-red",
  orange: "bg-brand-orange",
};

const iconBgMap: Record<string, string> = {
  blue: "from-brand-blue to-brand-blue-light",
  purple: "from-brand-blue to-indigo-600",
  red: "from-brand-red to-brand-red-light",
  orange: "from-brand-blue via-brand-blue-light to-brand-purple",
};

interface TrustBadgesProps {
  badges: TrustBadgeItem[];
}

export default function TrustBadges({ badges }: TrustBadgesProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {badges.map((badge, index) => {
        const Icon = getIcon(badge.icon);
        return (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-white p-4 shadow-sm transition-shadow duration-300 hover:border-brand-blue/20 hover:shadow-md sm:p-5"
          >
            <div
              className={cn(
                "absolute left-0 top-0 h-1 w-full opacity-80 transition-opacity group-hover:opacity-100",
                accentMap[badge.accent] ?? "bg-brand-blue"
              )}
            />

            <div
              className={cn(
                "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12",
                iconBgMap[badge.accent] ?? "from-brand-blue to-brand-blue-light"
              )}
            >
              <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0">
              {badge.highlight ? (
                <>
                  <p className="text-lg font-bold leading-none text-brand-blue sm:text-xl">
                    {badge.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-brand-blue/80">
                    {badge.highlight}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold leading-snug text-brand-blue sm:text-base">
                  {badge.label}
                </p>
              )}
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted sm:text-xs">
                {badge.sub}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
