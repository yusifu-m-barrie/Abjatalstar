import {
  Globe2,
  ArrowDownToLine,
  Smartphone,
  Users,
  ArrowLeftRight,
  Briefcase,
  Receipt,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

export const SERVICES: Service[] = [
  {
    id: "international",
    title: "International Money Transfer",
    description:
      "Send money to family and friends abroad through Western Union, MoneyGram, and Ria with secure processing and real-time tracking.",
    icon: Globe2,
    features: [
      "Global reach to 200+ countries",
      "Competitive exchange rates",
      "Same-day delivery options",
    ],
  },
  {
    id: "receive",
    title: "Receive Money",
    description:
      "Collect international remittances quickly at any Abjatal Star branch. Bring your valid ID and transaction reference to receive your cash.",
    icon: ArrowDownToLine,
    features: [
      "Instant cash pickup",
      "Multiple partner networks",
      "Secure identity verification",
    ],
  },
  {
    id: "orange-money",
    title: "Orange Money Cash-In & Cash-Out",
    description:
      "Deposit and withdraw funds from your Orange Money wallet at our authorized agent locations across the country.",
    icon: Smartphone,
    features: [
      "Wallet top-ups and withdrawals",
      "Agent-verified transactions",
      "Convenient branch access",
    ],
  },
  {
    id: "mobile-money",
    title: "Mobile Money Agent Services",
    description:
      "Full Afrimoney and local mobile money agent support for transfers, balance inquiries, and account management.",
    icon: Users,
    features: [
      "Cash-in and cash-out",
      "Peer-to-peer transfers",
      "Account registration support",
    ],
  },
  {
    id: "local-transfer",
    title: "Local Money Transfer",
    description:
      "Send money domestically to friends, family, or business partners through our secure local transfer network.",
    icon: ArrowLeftRight,
    features: [
      "Same-day domestic transfers",
      "Branch-to-branch delivery",
      "Affordable local fees",
    ],
  },
  {
    id: "business",
    title: "Business Payment Support",
    description:
      "Dedicated payment solutions for businesses, including bulk transfers, supplier payments, and payroll support services.",
    icon: Briefcase,
    features: [
      "Bulk payment processing",
      "Business account support",
      "Priority transaction handling",
    ],
  },
  {
    id: "bill-payments",
    title: "Bill Payment Assistance",
    description:
      "Pay utility bills, school fees, and other recurring payments conveniently at any Abjatal Star branch or agent location.",
    icon: Receipt,
    features: [
      "Electricity and water bills",
      "School fee payments",
      "Multiple biller support",
    ],
  },
  {
    id: "agent-support",
    title: "Agent & Branch Support",
    description:
      "Our trained agents and branch staff provide hands-on assistance for every transaction, ensuring a smooth experience.",
    icon: Headphones,
    features: [
      "In-person guidance",
      "Transaction troubleshooting",
      "Multi-language support",
    ],
  },
];

export const SERVICE_OPTIONS = [
  "International Money Transfer",
  "Receive Money",
  "Orange Money",
  "Afrimoney / Mobile Money",
  "Local Money Transfer",
  "Business Payments",
  "Bill Payments",
  "General Inquiry",
] as const;
