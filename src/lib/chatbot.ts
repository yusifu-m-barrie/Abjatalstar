import { buildChatbotKnowledge, QUICK_QUESTIONS } from "@/data/chatbot-knowledge";
import type { BranchItem, SiteSettings } from "@/lib/content";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreIntent(input: string, keywords: string[]): number {
  const normalized = normalize(input);
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);
    if (normalized === normalizedKeyword) {
      score += 10;
    } else if (normalized.includes(normalizedKeyword)) {
      score += normalizedKeyword.split(" ").length * 3;
    } else {
      const words = normalizedKeyword.split(" ");
      const matchedWords = words.filter((w) => w.length > 2 && normalized.includes(w));
      score += matchedWords.length;
    }
  }

  return score;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export function getChatbotResponse(
  input: string,
  ctx: { business: SiteSettings; branches: BranchItem[] }
): ChatResponse {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      message: "Please type a question and I'll be happy to help!",
      suggestions: QUICK_QUESTIONS,
    };
  }

  const knowledge = buildChatbotKnowledge({
    business: ctx.business,
    branches: ctx.branches,
  });

  const { fallback, intents } = knowledge;

  let bestIntent = intents[0];
  let bestScore = 0;

  for (const intent of intents) {
    const score = scoreIntent(trimmed, intent.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestScore >= 2) {
    return {
      message: bestIntent.response,
      suggestions: bestIntent.suggestions ?? QUICK_QUESTIONS.slice(0, 3),
    };
  }

  return {
    message: fallback,
    suggestions: QUICK_QUESTIONS,
  };
}

export function getWelcomeMessage(business: Pick<SiteSettings, "shortName">): ChatResponse {
  return {
    message: `Hello! 👋 I'm the ${business.shortName} assistant. I can help you with remittance, Orange Money, mobile money, branches, fees, and more. What would you like to know?`,
    suggestions: QUICK_QUESTIONS,
  };
}
