"use client";

import Image from "next/image";
import { useState } from "react";
import { mailConfig } from "@/lib/mail-config";

interface MailLogoProps {
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-10 w-auto max-w-[160px]",
  md: "h-14 w-auto max-w-[220px]",
  lg: "h-16 w-auto max-w-[260px]",
};

export default function MailLogo({ size = "md" }: MailLogoProps) {
  const [useText, setUseText] = useState(false);
  const [src, setSrc] = useState(mailConfig.logoPath);

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
        src={src}
        alt={`${mailConfig.brandName} logo`}
        width={280}
        height={120}
        unoptimized
        className={`object-contain ${sizes[size]}`}
        onError={() => {
          if (src === mailConfig.logoPath) {
            setSrc(mailConfig.fallbackLogoPath);
          } else {
            setUseText(true);
          }
        }}
        priority
      />
    </div>
  );
}
