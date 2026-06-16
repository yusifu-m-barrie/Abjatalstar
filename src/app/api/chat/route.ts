import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/chatbot";
import { getBranches, getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message : "";

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const [business, branches] = await Promise.all([
      getSiteSettings(),
      getBranches(),
    ]);

    const response = getChatbotResponse(message, { business, branches });

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
