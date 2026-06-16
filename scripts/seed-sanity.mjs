import fs from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";

function loadEnvFile(filename) {
  const envPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

if (!projectId) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID.\n" +
      "Copy .env.example to .env, add your project ID, then re-run."
  );
  process.exit(1);
}

if (!token) {
  console.error(
    "Missing SANITY_API_TOKEN.\n" +
      "Create a token at https://www.sanity.io/manage → your project → API → Tokens\n" +
      "Use Editor permissions, add it to .env as SANITY_API_TOKEN=..., then re-run."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "published",
});

const contentDir = path.join(process.cwd(), "src", "content");

function readJson(filename) {
  const fullPath = path.join(contentDir, filename);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

async function main() {
  console.log("Seeding Sanity Studio singleton documents...");

  const settings = readJson("settings.json");
  const home = readJson("home.json");
  const services = readJson("services.json");
  const branches = readJson("branches.json");
  const agents = readJson("agents.json");
  const about = readJson("about.json");
  const contact = readJson("contact.json");

  // Logo is an `image` field in Sanity schema, so we leave it null during seed
  // (fallbacks in the frontend will still use the `/abjatal-star-logo.png` file).
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    ...settings,
    logo: null,
  });

  await client.createOrReplace({ _id: "homePage", _type: "homePage", ...home });
  await client.createOrReplace({
    _id: "servicesPage",
    _type: "servicesPage",
    ...services,
  });
  await client.createOrReplace({
    _id: "branchesPage",
    _type: "branchesPage",
    ...branches,
  });
  await client.createOrReplace({ _id: "agentsPage", _type: "agentsPage", ...agents });
  await client.createOrReplace({ _id: "aboutPage", _type: "aboutPage", ...about });
  await client.createOrReplace({
    _id: "contactPage",
    _type: "contactPage",
    ...contact,
  });

  console.log("Sanity seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

