"use client";

import { useEffect } from "react";
import Image from "next/image";
import { BUSINESS } from "@/lib/constants";

const ADMIN_URL = "/admin";

export default function JoinCmsClient() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(ADMIN_URL);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        background: "linear-gradient(180deg, #0f172a 0%, #1a237e 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 16,
          padding: "2rem 1.75rem 1.75rem",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <Image
          src={BUSINESS.logo}
          alt={`${BUSINESS.name} logo`}
          width={220}
          height={80}
          unoptimized
          style={{ height: 64, width: "auto", margin: "0 auto 1.25rem" }}
        />
        <h1 style={{ fontSize: 22, margin: "0 0 8px", color: "#0f172a" }}>
          Open the website CMS
        </h1>
        <p style={{ color: "#475569", lineHeight: 1.6, margin: "0 0 20px" }}>
          After you accept the invitation, sign in with the{" "}
          <strong>same Gmail</strong> you used to accept. You will be taken to{" "}
          <code>abjatalstar.com/admin</code>.
        </p>
        <a
          href={ADMIN_URL}
          style={{
            display: "inline-block",
            background: "#1a237e",
            color: "#fff",
            borderRadius: 8,
            padding: "12px 18px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Continue with Google
        </a>
        <p style={{ color: "#64748b", fontSize: 13, margin: "16px 0 0" }}>
          Redirecting you to the CMS now…
        </p>
      </div>
    </main>
  );
}
