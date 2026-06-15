import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "navbar" | "footer";
  className?: string;
}

export default function Logo({ variant = "navbar", className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 items-center transition-opacity hover:opacity-90",
        className
      )}
    >
      <div
        className={cn(
          variant === "footer" && "rounded-xl bg-white px-3 py-2"
        )}
      >
        <Image
          src={BUSINESS.logo}
          alt={`${BUSINESS.name} logo`}
          width={320}
          height={140}
          priority
          unoptimized
          className={cn(
            "h-auto w-auto object-contain",
            variant === "navbar" && "h-12 w-auto max-w-[200px] sm:h-16 sm:max-w-[260px]",
            variant === "footer" && "h-16 w-auto max-w-[260px] sm:h-[4.5rem] sm:max-w-[280px]"
          )}
        />
      </div>
    </Link>
  );
}
