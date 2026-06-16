import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

const TO_EMAIL =
  process.env.CONTACT_FORM_TO_EMAIL ?? "usifubarriem@gmail.com";

const FROM_EMAIL =
  process.env.CONTACT_FORM_FROM_EMAIL ??
  "Abjatal Star <onboarding@resend.dev>";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot — bots fill hidden fields
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ success: true });
    }

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const service =
      typeof body.service === "string" ? body.service.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!fullName || !phone || !service || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (
      fullName.length > 120 ||
      phone.length > 40 ||
      service.length > 80 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields are too long." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Contact form is not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    const business = await getSiteSettings();
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `New enquiry — ${service} (${business.shortName})`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Site:</strong> ${escapeHtml(business.name)}</p>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        <hr />
        <p style="color:#666;font-size:12px">Sent from the contact form at ${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL ?? "the website")}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send your message. Please try again or call us directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
