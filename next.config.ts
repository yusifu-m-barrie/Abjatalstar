import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/config.yml",
        destination: "/api/cms-config",
      },
      {
        source: "/admin/config.yml",
        destination: "/api/cms-config",
      },
    ];
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
