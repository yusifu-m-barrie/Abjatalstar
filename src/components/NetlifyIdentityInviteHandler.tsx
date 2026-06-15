"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    netlifyIdentitySettings?: { APIUrl: string };
    netlifyIdentity?: {
      on: (event: string, cb: (user?: unknown) => void) => void;
      open: (mode?: string) => void;
    };
  }
}

function hasIdentityHash() {
  const hash = window.location.hash;
  return (
    hash.includes("invite_token") ||
    hash.includes("confirmation_token") ||
    hash.includes("recovery_token")
  );
}

/** Loads Identity on invite/recovery links so the signup modal appears (not just on /admin). */
export default function NetlifyIdentityInviteHandler() {
  useEffect(() => {
    if (!hasIdentityHash()) return;

    window.netlifyIdentitySettings = {
      APIUrl: `${window.location.origin}/.netlify/identity`,
    };

    if (document.getElementById("netlify-identity-invite")) return;

    const script = document.createElement("script");
    script.id = "netlify-identity-invite";
    script.src =
      "https://identity.netlify.com/v1/netlify-identity-widget.js";
    script.onload = () => {
      if (!window.netlifyIdentity) return;

      window.netlifyIdentity.on("init", (user) => {
        if (!user && hasIdentityHash()) {
          window.netlifyIdentity!.open("signup");
        }
      });

      window.netlifyIdentity.on("login", () => {
        window.location.href = "/admin";
      });
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
