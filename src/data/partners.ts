import {
  Globe,
  Send,
  Banknote,
  Smartphone,
  Wallet,
  Building2,
  type LucideIcon,
} from "lucide-react";

export interface Partner {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const PARTNERS: Partner[] = [
  {
    id: "western-union",
    name: "Western Union",
    description:
      "Send and receive money worldwide through one of the most trusted global transfer networks.",
    icon: Globe,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "moneygram",
    name: "MoneyGram",
    description:
      "Fast international money transfers to over 200 countries with competitive exchange rates.",
    icon: Send,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "ria",
    name: "Ria Money Transfer",
    description:
      "Reliable cross-border remittance services with quick delivery and transparent fees.",
    icon: Banknote,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "orange-money",
    name: "Orange Money",
    description:
      "Convenient mobile wallet cash-in and cash-out services for everyday transactions.",
    icon: Smartphone,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    id: "afrimoney",
    name: "Afrimoney / Mobile Money",
    description:
      "Local mobile money agent services for deposits, withdrawals, and peer transfers.",
    icon: Wallet,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "local-mobile",
    name: "Local Mobile Money",
    description:
      "Nationwide cash-in and cash-out support through our authorized agent network.",
    icon: Building2,
    color: "text-brand-blue",
    bgColor: "bg-blue-50",
  },
];
