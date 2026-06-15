"use client";

import { useEffect, useState } from "react";
import { parse as parseYaml } from "yaml";

declare global {
  interface Window {
    CMS?: { init: (opts: { config: Record<string, unknown> }) => void };
    CMS_MANUAL_INIT?: boolean;
    __CMS_INIT_PROMISE__?: Promise<void>;
  }
}

type LoadState = "loading" | "ready" | "error";

const CMS_VERSION = "3.12.2";

const CMS_ASSETS = {
  script: [
    `https://unpkg.com/decap-cms@${CMS_VERSION}/dist/decap-cms.js`,
    `https://cdn.jsdelivr.net/npm/decap-cms@${CMS_VERSION}/dist/decap-cms.js`,
  ],
  stylesheet: [
    `https://unpkg.com/decap-cms@${CMS_VERSION}/dist/cms.css`,
    `https://cdn.jsdelivr.net/npm/decap-cms@${CMS_VERSION}/dist/cms.css`,
  ],
};

function loadStylesheet(id: string, urls: string[]) {
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = urls[0];
  link.onerror = () => {
    if (urls[1]) link.href = urls[1];
  };
  document.head.appendChild(link);
}

function loadScript(urls: string[]): Promise<void> {
  if (window.CMS) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let index = 0;

    const tryNext = () => {
      if (index >= urls.length) {
        reject(
          new Error(
            "CMS failed to load. Check your internet connection and try again."
          )
        );
        return;
      }

      const script = document.createElement("script");
      script.src = urls[index];
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        index += 1;
        tryNext();
      };
      document.body.appendChild(script);
    };

    tryNext();
  });
}

export default function CmsAdminLoader() {
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    window.CMS_MANUAL_INIT = true;

    async function loadCms() {
      loadStylesheet("decap-cms-css", CMS_ASSETS.stylesheet);

      if (!document.getElementById("cms-theme-css")) {
        const theme = document.createElement("link");
        theme.id = "cms-theme-css";
        theme.rel = "stylesheet";
        theme.href = "/admin/cms-theme.css";
        document.head.appendChild(theme);
      }

      await loadScript(CMS_ASSETS.script);

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

    if (!window.__CMS_INIT_PROMISE__) {
      window.__CMS_INIT_PROMISE__ = loadCms();
    }

    window.__CMS_INIT_PROMISE__
      .then(() => setState("ready"))
      .catch((error) => {
        window.__CMS_INIT_PROMISE__ = undefined;
        console.error("CMS failed to initialize:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load CMS"
        );
        setState("error");
      });
  }, []);

  if (state === "error") {
    return (
      <div className="cms-loading">
        <p className="font-semibold text-red-600">Could not load editor</p>
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="cms-loading">
        <div className="cms-loading-spinner" aria-hidden />
        <p>Loading content editor...</p>
      </div>
    );
  }

  return null;
}
