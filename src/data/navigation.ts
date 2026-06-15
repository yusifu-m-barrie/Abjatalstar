export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Branches", href: "/branches" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact Us", href: "/contact" },
  ],
  services: [
    { label: "International Transfer", href: "/services#international" },
    { label: "Receive Money", href: "/services#receive" },
    { label: "Mobile Money", href: "/services#mobile-money" },
    { label: "Bill Payments", href: "/services#bill-payments" },
  ],
  locations: [
    { label: "Find a Branch", href: "/branches" },
    { label: "Freetown Main", href: "/branches#freetown" },
    { label: "Makeni Branch", href: "/branches#makeni" },
    { label: "Bo Branch", href: "/branches#bo" },
  ],
} as const;
