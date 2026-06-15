"use client";

import { useEffect, useRef } from "react";
import { parse as parseYaml } from "yaml";

declare global {
  interface Window {
    CMS?: { init: (opts: { config: Record<string, unknown> }) => void };
    CMS_MANUAL_INIT?: boolean;
  }
}

export default function CmsAdminLoader() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    window.CMS_MANUAL_INIT = true;

    async function loadCms() {
      if (!document.getElementById("netlify-cms-css")) {
        const link = document.createElement("link");
        link.id = "netlify-cms-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/netlify-cms@^2.10.0/dist/cms.css";
        document.head.appendChild(link);
      }

      if (!window.CMS) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://unpkg.com/netlify-cms@^2.10.0/dist/netlify-cms.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Netlify CMS failed to load"));
          document.body.appendChild(script);
        });
      }

      const response = await fetch("/api/cms-config");
      if (!response.ok) {
        throw new Error(`Config load failed: ${response.status}`);
      }

      const configText = await response.text();
      const config = parseYaml(configText) as Record<string, unknown>;

      window.CMS!.init({
        config: {
          ...config,
          load_config_file: false,
        },
      });
    }

    loadCms().catch((error) => {
      console.error("Netlify CMS failed to initialize:", error);
    });
  }, []);

  return null;
}
