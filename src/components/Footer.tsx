import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { FOOTER_LINKS } from "@/data/navigation";
import { BUSINESS, BUSINESS_HOURS, SOCIAL_LINKS } from "@/lib/constants";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue text-white">
      <div className="container-custom px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="footer" />
            <p className="mt-4 text-sm leading-relaxed text-blue-200/80">
              {BUSINESS.subtitle}. Your trusted partner for international
              remittances, Orange Money, and FX services across Sierra Leone.
            </p>
            <div className="mt-5 flex gap-3">
              {Object.entries(SOCIAL_LINKS).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm capitalize transition-colors hover:bg-white/20"
                  aria-label={name}
                >
                  {name[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-orange-light">
              Company
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-orange-light">
              Services
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-orange-light">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-blue-200/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-light" />
                {BUSINESS.address}
              </li>
              <li>
                <a
                  href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 text-sm text-blue-200/80 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-green-light" />
                  {BUSINESS.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="flex items-center gap-2.5 text-sm text-blue-200/80 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-green-light" />
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-200/80">
              <Clock className="h-4 w-4 shrink-0 text-brand-green-light" />
              <span>{BUSINESS_HOURS.summary}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-blue-200/60">
            &copy; {currentYear} {BUSINESS.name}. All rights reserved.
          </p>
          <p className="text-xs text-blue-200/40">
            {BUSINESS.license} · Est. {BUSINESS.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
