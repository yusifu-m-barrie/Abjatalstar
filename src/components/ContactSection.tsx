"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useBusiness } from "@/context/SiteSettingsContext";
import BusinessHours from "./BusinessHours";

interface ContactSectionContent {
  eyebrow: string;
  title: string;
  description: string;
  contactInfoTitle: string;
  formTitle: string;
  successTitle: string;
  successMessage: string;
  sendAnotherText: string;
  submitButton: string;
  fields: {
    fullName: { label: string; placeholder: string };
    phone: { label: string; placeholder: string };
    service: { label: string; placeholder: string };
    message: { label: string; placeholder: string };
  };
}

interface ContactSectionProps {
  section: ContactSectionContent;
  serviceOptions: string[];
  showHeading?: boolean;
}

export default function ContactSection({
  section,
  serviceOptions,
  showHeading = true,
}: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const business = useBusiness();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          service: formData.get("service"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to send message. Please try again.");
        return;
      }

      form.reset();
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding bg-section-alt" id="contact">
      <div className="container-custom">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-green">
              {section.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-blue sm:text-4xl">
              {section.title}
            </h2>
            <p className="mt-4 text-muted">{section.description}</p>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="rounded-2xl border border-border bg-white p-6 card-shadow">
              <h3 className="mb-5 text-lg font-bold text-brand-blue">
                {section.contactInfoTitle}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                    <Phone className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-blue">Phone</p>
                    <a
                      href={`tel:${business.phone.replace(/\s/g, "")}`}
                      className="text-sm text-muted hover:text-brand-green"
                    >
                      {business.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                    <Mail className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-blue">Email</p>
                    <a
                      href={`mailto:${business.email}`}
                      className="text-sm text-muted hover:text-brand-green"
                    >
                      {business.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                    <MapPin className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-blue">Head Office</p>
                    <p className="text-sm text-muted">{business.address}</p>
                  </div>
                </li>
              </ul>
            </div>

            <BusinessHours variant="card" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 card-shadow">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10">
                    <CheckCircle2 className="h-8 w-8 text-brand-green" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-blue">
                    {section.successTitle}
                  </h3>
                  <p className="mt-2 max-w-sm text-muted">{section.successMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setError(null);
                    }}
                    className="mt-6 text-sm font-medium text-brand-green hover:underline"
                  >
                    {section.sendAnotherText}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold text-brand-blue">
                    {section.formTitle}
                  </h3>

                  {/* Honeypot — hidden from users, traps bots */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-1.5 block text-sm font-medium text-brand-blue"
                      >
                        {section.fields.fullName.label}
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        placeholder={section.fields.fullName.placeholder}
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1.5 block text-sm font-medium text-brand-blue"
                      >
                        {section.fields.phone.label}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        placeholder={section.fields.phone.placeholder}
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="service"
                      className="mb-1.5 block text-sm font-medium text-brand-blue"
                    >
                      {section.fields.service.label}
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {section.fields.service.placeholder}
                      </option>
                      {serviceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium text-brand-blue"
                    >
                      {section.fields.message.label}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder={section.fields.message.placeholder}
                      className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-green-light hover:shadow-lg hover:shadow-brand-green/25 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Sending..." : section.submitButton}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
