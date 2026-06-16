"use client";

import { Clock } from "lucide-react";
import { useBusinessHours } from "@/context/SiteSettingsContext";

interface BusinessHoursProps {
  variant?: "inline" | "card";
}

export default function BusinessHours({ variant = "inline" }: BusinessHoursProps) {
  const hours = useBusinessHours();
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Clock className="h-4 w-4 text-brand-green" />
        <span>{hours.summary}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 card-shadow">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-5 w-5 text-brand-green" />
        <h3 className="font-semibold text-brand-blue">Business Hours</h3>
      </div>
      <ul className="space-y-2 text-sm text-muted">
        <li>{hours.weekdays}</li>
        <li>{hours.saturday}</li>
        <li>{hours.sunday}</li>
      </ul>
    </div>
  );
}
