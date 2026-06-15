import {
  Zap,
  ShieldCheck,
  MapPin,
  HeartHandshake,
  UserCheck,
  BadgePercent,
  Navigation,
  type LucideIcon,
} from "lucide-react";

export interface WhyChooseItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const WHY_CHOOSE_US: WhyChooseItem[] = [
  {
    title: "Fast Transactions",
    description:
      "Most transfers are processed within minutes. Send or receive money without unnecessary delays.",
    icon: Zap,
  },
  {
    title: "Secure & Trusted",
    description:
      "We partner with globally recognized payment networks and follow strict security protocols.",
    icon: ShieldCheck,
  },
  {
    title: "Multiple Branches",
    description:
      "With branches across major cities, you are never far from a Abjatal Star location.",
    icon: MapPin,
  },
  {
    title: "Friendly Customer Service",
    description:
      "Our trained staff guide you through every step with patience, clarity, and respect.",
    icon: HeartHandshake,
  },
  {
    title: "Reliable Agents",
    description:
      "Every agent is authorized, verified, and committed to delivering accurate transactions.",
    icon: UserCheck,
  },
  {
    title: "Competitive Charges",
    description:
      "Transparent, affordable fees with no hidden costs — you always know what you pay.",
    icon: BadgePercent,
  },
  {
    title: "Easy Access Nationwide",
    description:
      "From Freetown to Kono, our growing network ensures financial services reach every community.",
    icon: Navigation,
  },
];
