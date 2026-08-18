"use client";

import Image from "next/image";
import { useState } from "react";
import { mailConfig } from "@/lib/mail-config";

interface MailLogoProps {
  size?: "sm" | "md" | "lg";
  /** Override default logo path (e.g. from Sanity site settings). */
  src?: string;
}

const sizes = {
  sm: "h-10 w-auto max-w-[160px]",
  md: "h-14 w-auto max-w-[220px]",
  lg: "h-16 w-auto max-w-[260px]",
};

export default function MailLogo({ size = "md", src }: MailLogoProps) {
  const logoPath = src ?? mailConfig.logoPath;
  const hasLogo = Boolean(logoPath);
  const [useText, setUseText] = useState(!hasLogo);
  const [activeSrc, setActiveSrc] = useState(logoPath ?? "");

  if (useText) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold tracking-tight text-brand-blue sm:text-3xl">
          {mailConfig.brandName}
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Image
        src={activeSrc}
        alt={`${mailConfig.brandName} logo`}
        width={280}
        height={120}
        unoptimized
        className={`object-contain ${sizes[size]}`}
        onError={() => {
          if (activeSrc === logoPath && mailConfig.fallbackLogoPath) {
            setActiveSrc(mailConfig.fallbackLogoPath);
          } else {
            setUseText(true);
          }
        }}
        priority
      />
    </div>
  );
}
