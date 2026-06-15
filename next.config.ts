import type { NextConfig } from "next";

/** Netlify site URL (e.g. https://abjatalstar.netlify.app) — required for CMS on Vercel */
const netlifySiteUrl = process.env.NETLIFY_SITE_URL?.replace(/\/$/, "");
const hasValidNetlifySiteUrl =
  !!netlifySiteUrl &&
  /^https?:\/\//.test(netlifySiteUrl) &&
  !netlifySiteUrl.includes("NETLIFY_SITE_URL");

const nextConfig: NextConfig = {
  async rewrites() {
    const rewrites = [
      {
        source: "/config.yml",
        destination: "/api/cms-config",
      },
      {
        source: "/admin/config.yml",
        destination: "/api/cms-config",
      },
    ];

    // Proxy Netlify Identity + Git Gateway when the site is hosted on Vercel
    if (hasValidNetlifySiteUrl && netlifySiteUrl) {
      rewrites.push(
        {
          source: "/.netlify/identity/:path*",
          destination: `${netlifySiteUrl}/.netlify/identity/:path*`,
        },
        {
          source: "/.netlify/git/:path*",
          destination: `${netlifySiteUrl}/.netlify/git/:path*`,
        }
      );
    }

    return rewrites;
  },
  async headers() {
    return [
      {
        source: "/config.yml",
        headers: [
          { key: "Content-Type", value: "text/yaml; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        source: "/admin/config.yml",
        headers: [
          { key: "Content-Type", value: "text/yaml; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        source: "/api/cms-config",
        headers: [
          { key: "Content-Type", value: "text/yaml; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
