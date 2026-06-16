import type { BranchItem, SiteSettings } from "@/lib/content";

export interface ChatIntent {
  id: string;
  keywords: string[];
  response: string;
  suggestions?: string[];
}

export const QUICK_QUESTIONS = [
  "How do I send money?",
  "How do I receive money?",
  "Branch locations",
  "Business hours",
  "Orange Money services",
  "What ID do I need?",
];

export function buildChatbotKnowledge(params: {
  business: SiteSettings;
  branches: BranchItem[];
}) {
  const { business, branches } = params;
  const businessHours = business.hours;

  const branchList = branches
    .map((b) => `• ${b.name} (${b.city}) — ${b.address} | ${b.phone}`)
    .join("\n");

  const welcome = `Hello! 👋 I'm the ${business.shortName} assistant. I can help you with remittance, Orange Money, mobile money, branches, fees, and more. What would you like to know?`;

  const fallback = `I'm not sure I understood that completely. Here are topics I can help with:\n\n• Sending & receiving money\n• Western Union, MoneyGram & Ria\n• Orange Money & Afrimoney\n• Branch locations & business hours\n• Fees, ID requirements & tracking\n\nTry rephrasing your question, or tap a suggestion below. For complex issues, call us at ${business.phoneDisplay}.`;

  const intents: ChatIntent[] = [
    {
      id: "greeting",
      keywords: [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "start",
      ],
      response: welcome,
      suggestions: QUICK_QUESTIONS,
    },
    {
      id: "thanks",
      keywords: ["thank", "thanks", "appreciate", "helpful"],
      response:
        "You're welcome! If you have any other questions about remittance or our services, feel free to ask. You can also visit any branch or call us directly.",
      suggestions: ["Branch locations", "Contact information"],
    },
    {
      id: "goodbye",
      keywords: ["bye", "goodbye", "see you", "that's all", "no more"],
      response: `Thank you for chatting with ${business.shortName}! Visit us at any branch or contact us at ${business.phoneDisplay} for in-person assistance. Have a great day!`,
      suggestions: ["Our services", "Branch locations"],
    },
    {
      id: "send-money",
      keywords: [
        "send money",
        "send cash",
        "transfer money",
        "how to send",
        "sending",
        "send abroad",
        "international transfer",
        "remit",
        "remittance send",
      ],
      response: `To send money at ${business.shortName}:\n\n1. Visit any of our branches with a valid ID\n2. Provide the receiver's full name, country, and contact details\n3. Choose your service (Western Union, MoneyGram, or Ria)\n4. Pay the transfer amount plus applicable fees\n5. You'll receive a receipt and tracking reference number\n\nThe receiver can collect the money at their nearest payout location.`,
      suggestions: ["Transfer fees", "Branch locations", "Western Union"],
    },
    {
      id: "receive-money",
      keywords: [
        "receive money",
        "collect money",
        "pick up",
        "pickup",
        "how to receive",
        "getting money",
        "cash out remittance",
        "receive transfer",
      ],
      response: `To receive money at ${business.shortName}:\n\n1. Visit any branch with a valid government-issued photo ID\n2. Provide the transaction reference / control number from the sender\n3. Our agent verifies your identity and transaction details\n4. Collect your cash immediately once verified\n\nMake sure the name on your ID matches the name the sender used.`,
      suggestions: ["What ID do I need?", "Branch locations", "Business hours"],
    },
    {
      id: "western-union",
      keywords: ["western union", "wu ", "western"],
      response: `${business.shortName} is an authorized Western Union agent. You can send money to 200+ countries and receive international transfers at any of our branches.\n\nServices include:\n• Send money worldwide\n• Receive international remittances\n• Same-day delivery options available\n\nVisit a branch with valid ID to get started.`,
      suggestions: ["How do I send money?", "Branch locations", "Transfer fees"],
    },
    {
      id: "moneygram",
      keywords: ["moneygram", "money gram", "mg "],
      response: `We offer full MoneyGram services at ${business.shortName} branches. Send money internationally with competitive rates or receive MoneyGram transfers from abroad.\n\nBring valid ID and receiver details when sending. To receive, bring your ID and the reference number from the sender.`,
      suggestions: ["How do I receive money?", "Branch locations"],
    },
    {
      id: "ria",
      keywords: ["ria", "ria money"],
      response: `Ria Money Transfer is available at select ${business.shortName} branches including Freetown, Bo, and Kenema. Ria offers reliable cross-border remittance with transparent fees and quick delivery.\n\nVisit a branch to send or receive via Ria.`,
      suggestions: ["Branch locations", "How do I send money?"],
    },
    {
      id: "orange-money",
      keywords: [
        "orange money",
        "orange",
        "orange cash",
        "orange wallet",
        "cash in",
        "cash out",
        "cash-in",
        "cash-out",
      ],
      response: `${business.shortName} provides Orange Money agent services:\n\n• Cash-In — deposit cash into your Orange Money wallet\n• Cash-Out — withdraw funds from your wallet\n• Balance inquiries and account support\n\nVisit any branch during business hours with your Orange Money registered phone number.`,
      suggestions: ["Afrimoney services", "Branch locations", "Business hours"],
    },
    {
      id: "afrimoney",
      keywords: [
        "afrimoney",
        "afri money",
        "mobile money",
        "momo",
        "wallet",
        "africell",
        "mobile cash",
      ],
      response:
        "We offer Afrimoney and local mobile money agent services:\n\n• Cash-in and cash-out\n• Peer-to-peer transfers\n• Account registration support\n• Balance inquiries\n\nOur trained agents at every branch can assist with all mobile money transactions.",
      suggestions: ["Orange Money services", "Branch locations"],
    },
    {
      id: "branches",
      keywords: [
        "branch",
        "branches",
        "location",
        "locations",
        "address",
        "where",
        "near me",
        "find branch",
        "office",
        "agent location",
      ],
      response: `${business.shortName} has ${branches.length} branches across Sierra Leone:\n\n${branchList}\n\nVisit any branch during business hours for in-person assistance.`,
      suggestions: ["Business hours", "Contact information"],
    },
    {
      id: "hours",
      keywords: [
        "hour",
        "hours",
        "open",
        "close",
        "closing",
        "opening",
        "time",
        "schedule",
        "when open",
      ],
      response: `Our business hours:\n\n📅 ${businessHours.weekdays}\n📅 ${businessHours.saturday}\n📅 ${businessHours.sunday}\n\nBranch hours may vary slightly — contact your nearest branch to confirm.`,
      suggestions: ["Branch locations", "Contact information"],
    },
    {
      id: "fees",
      keywords: [
        "fee",
        "fees",
        "charge",
        "charges",
        "cost",
        "price",
        "rate",
        "how much",
        "expensive",
        "cheap",
      ],
      response: `Transfer fees at ${business.shortName} depend on:\n\n• The service used (Western Union, MoneyGram, Ria, etc.)\n• Destination country and amount sent\n• Exchange rate at time of transaction\n\nWe offer competitive and transparent pricing with no hidden charges. Visit any branch for an exact quote before sending — our agents will show you the full breakdown.`,
      suggestions: ["How do I send money?", "FX Bureau rates"],
    },
    {
      id: "fx",
      keywords: ["fx", "exchange", "currency", "forex", "bureau", "dollar", "rate", "convert"],
      response: `${business.shortName} operates as a licensed FX Bureau. We offer foreign currency exchange services for remittance and business needs.\n\nVisit our Freetown Main Branch or contact us for current exchange rates, as rates change daily based on market conditions.`,
      suggestions: ["Branch locations", "Contact information"],
    },
    {
      id: "documents",
      keywords: [
        "id",
        "identification",
        "document",
        "documents",
        "passport",
        "license",
        "voter",
        "required",
        "bring",
      ],
      response: `For most transactions at ${business.shortName}, you'll need:\n\n✅ Valid government-issued photo ID (passport, national ID, or driver's license)\n✅ Transaction reference number (for receiving money)\n✅ Receiver's full details (for sending money)\n\nFor large transactions, additional verification may be required. Our agents will guide you on the spot.`,
      suggestions: ["How do I send money?", "How do I receive money?"],
    },
    {
      id: "contact",
      keywords: [
        "contact",
        "phone",
        "call",
        "email",
        "reach",
        "speak",
        "talk",
        "whatsapp",
      ],
      response: `Contact ${business.shortName}:\n\n📞 Phone: ${business.phoneDisplay}\n📧 Email: ${business.email}\n📍 Head Office: ${business.address}\n💬 WhatsApp: ${business.phoneDisplay}\n\nYou can also visit any branch or use our contact form on the website.`,
      suggestions: ["Branch locations", "Business hours"],
    },
    {
      id: "bill-payments",
      keywords: [
        "bill",
        "bills",
        "payment",
        "utility",
        "electricity",
        "water",
        "school fee",
        "school fees",
      ],
      response: `${business.shortName} offers bill payment assistance at all branches:\n\n• Electricity and water bills\n• School fee payments\n• Other recurring payments\n\nVisit a branch with your bill details and payment amount. Our agents will process it for you.`,
      suggestions: ["Branch locations", "Business hours"],
    },
    {
      id: "business",
      keywords: ["business", "company", "bulk", "payroll", "supplier", "corporate"],
      response: `We provide business payment support including:\n\n• Bulk payment processing\n• Supplier payments\n• Payroll support\n• Priority transaction handling\n\nContact us at ${business.email} or visit the Freetown Main Branch to discuss your business needs.`,
      suggestions: ["Contact information", "Branch locations"],
    },
    {
      id: "local-transfer",
      keywords: ["local transfer", "domestic", "within sierra leone", "same country", "local send"],
      response: `${business.shortName} offers local money transfers within Sierra Leone:\n\n• Same-day domestic transfers\n• Branch-to-branch delivery\n• Affordable local fees\n\nVisit any branch with the recipient's details and valid ID to send money locally.`,
      suggestions: ["Branch locations", "Transfer fees"],
    },
    {
      id: "tracking",
      keywords: [
        "track",
        "tracking",
        "reference",
        "control number",
        "mtcn",
        "status",
        "where is my",
      ],
      response: `To track a transfer:\n\n• Keep your receipt and reference/control number (MTCN) safe\n• The sender can check status with the reference number at any branch\n• Receivers need the reference number and valid ID to collect funds\n\nIf you have issues with a transaction, visit the branch where it was sent or call ${business.phoneDisplay}.`,
      suggestions: ["How do I receive money?", "Contact information"],
    },
    {
      id: "limits",
      keywords: ["limit", "limits", "maximum", "minimum", "how much can", "cap"],
      response: `Transfer limits depend on the service provider (Western Union, MoneyGram, Ria) and destination country regulations. Limits also vary based on verification level and transaction history.\n\nVisit any ${business.shortName} branch with your ID — our agents will tell you the exact limit for your specific transfer.`,
      suggestions: ["How do I send money?", "Transfer fees"],
    },
    {
      id: "security",
      keywords: ["safe", "secure", "security", "trust", "scam", "fraud", "legitimate", "licensed"],
      response: `${business.shortName} is a ${business.license.toLowerCase()}. We partner with globally recognized networks and follow strict security protocols.\n\n• Every transaction is verified\n• Authorized agents at all branches\n• Encrypted processing through partner networks\n\nNever share your reference number with strangers. Only collect money in person with valid ID.`,
      suggestions: ["About Abjatal Star", "Branch locations"],
    },
    {
      id: "about",
      keywords: ["about", "who are you", "company", "abjatal", "story", "founded", "experience"],
      response: `${business.name} has served Sierra Leone since ${business.founded} as a trusted ${business.subtitle} provider.\n\nWe help customers send and receive money through Western Union, MoneyGram, Ria, Orange Money, Afrimoney, and local services — with ${branches.length} branches nationwide.`,
      suggestions: ["Our services", "Branch locations"],
    },
    {
      id: "services",
      keywords: ["service", "services", "what do you offer", "what can you do", "help with"],
      response: `${business.shortName} offers:\n\n🌍 International Money Transfer (Western Union, MoneyGram, Ria)\n💵 Receive Money from abroad\n📱 Orange Money Cash-In & Cash-Out\n📲 Afrimoney / Mobile Money Agent Services\n🔄 Local Money Transfer\n💼 Business Payment Support\n🧾 Bill Payment Assistance\n🏢 Agent & Branch Support\n💱 FX Bureau Services`,
      suggestions: ["How do I send money?", "Orange Money services", "Branch locations"],
    },
  ];

  return { welcome, fallback, intents };
}

