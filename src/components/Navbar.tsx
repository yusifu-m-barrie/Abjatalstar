"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { NAV_LINKS } from "@/data/navigation";
import { BUSINESS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div className="hidden bg-brand-blue text-white lg:block">
        <div className="container-custom flex items-center justify-between px-4 py-2 text-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Phone className="h-3.5 w-3.5" />
              {BUSINESS.phoneDisplay}
            </a>
            <span className="text-white/40">|</span>
            <span className="text-white/80">{BUSINESS.tagline}</span>
          </div>
          <Link
            href="/contact"
            className="font-medium text-brand-orange-light transition-opacity hover:opacity-80"
          >
            Get in Touch →
          </Link>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border bg-white/95 shadow-sm backdrop-blur-md"
            : "bg-white"
        )}
      >
        <nav className="container-custom flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo variant="navbar" />

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brand-blue/5 text-brand-blue"
                    : "text-muted hover:bg-gray-50 hover:text-brand-blue"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/branches"
              className="rounded-xl border border-brand-blue px-5 py-2.5 text-sm font-semibold text-brand-blue transition-all hover:bg-brand-blue hover:text-white"
            >
              Find a Branch
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-green-light hover:shadow-lg hover:shadow-brand-green/25"
            >
              Contact Us
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-brand-blue lg:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-border bg-white lg:hidden"
            >
              <div className="container-custom space-y-1 px-4 py-4 sm:px-6">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-medium transition-colors",
                        pathname === link.href
                          ? "bg-brand-blue/5 text-brand-blue"
                          : "text-muted hover:bg-gray-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="flex flex-col gap-2 pt-4">
                  <Link
                    href="/branches"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-brand-blue py-3 text-center text-sm font-semibold text-brand-blue"
                  >
                    Find a Branch
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-brand-green py-3 text-center text-sm font-semibold text-white"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
