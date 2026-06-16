import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

const TO_EMAIL =
  process.env.CONTACT_FORM_TO_EMAIL ?? "info@abjatalstar.com";

const FROM_EMAIL =
  process.env.CONTACT_FORM_FROM_EMAIL ??
  "Abjatal Star <onboarding@resend.dev>";

/** Resend test mode only delivers to this address until abjatalstar.com is verified. */
const RESEND_FALLBACK_TO =
  process.env.RESEND_FALLBACK_TO ?? "usifubarriem@gmail.com";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(
  businessName: string,
  fullName: string,
  phone: string,
  service: string,
  message: string,
  notice?: string
): string {
  const noticeBlock = notice
    ? `<p style="background:#fff3cd;padding:12px;border-radius:8px;color:#856404"><strong>Note:</strong> ${escapeHtml(notice)}</p>`
    : "";

  return `
    ${noticeBlock}
    <h2>New contact form submission</h2>
    <p><strong>Site:</strong> ${escapeHtml(businessName)}</p>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Service:</strong> ${escapeHtml(service)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    <hr />
    <p style="color:#666;font-size:12px">Sent from the contact form at ${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL ?? "the website")}</p>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
    const subject = `New enquiry — ${service} (${business.shortName})`;
    const html = buildEmailHtml(
      business.name,
      fullName,
      phone,
      service,
      message
    );

    let result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject,
      html,
    });

    // Resend test sender can only deliver to the account owner until the domain is verified.
    if (
      result.error?.statusCode === 403 &&
      TO_EMAIL.toLowerCase() !== RESEND_FALLBACK_TO.toLowerCase()
    ) {
      console.warn(
        `Resend blocked delivery to ${TO_EMAIL}; retrying to ${RESEND_FALLBACK_TO}. Verify abjatalstar.com at resend.com/domains.`
      );

      result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [RESEND_FALLBACK_TO],
        subject: `[For ${TO_EMAIL}] ${subject}`,
        html: buildEmailHtml(
          business.name,
          fullName,
          phone,
          service,
          message,
          `This message was intended for ${TO_EMAIL}. Verify abjatalstar.com on Resend to deliver directly to that inbox.`
        ),
      });
    }

    if (result.error) {
      console.error("Resend error:", result.error);
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
