import {
  CHAT_INTENTS,
  CHAT_FALLBACK,
  CHAT_WELCOME,
  QUICK_QUESTIONS,
} from "@/data/chatbot-knowledge";

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

export function getChatbotResponse(input: string): ChatResponse {
  const trimmed = input.trim();
  if (!trimmed) {
    return { message: "Please type a question and I'll be happy to help!", suggestions: QUICK_QUESTIONS };
  }

  let bestIntent = CHAT_INTENTS[0];
  let bestScore = 0;

  for (const intent of CHAT_INTENTS) {
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
    message: CHAT_FALLBACK,
    suggestions: QUICK_QUESTIONS,
  };
}

export function getWelcomeMessage(): ChatResponse {
  return {
    message: CHAT_WELCOME,
    suggestions: QUICK_QUESTIONS,
  };
}
