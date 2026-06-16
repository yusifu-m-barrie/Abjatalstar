import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../../sanity/env";

/** Seconds before refetching Sanity content (0 in dev = always fresh). */
export const sanityRevalidate =
  process.env.NODE_ENV === "development" ? 0 : 60;

export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
});

export { isSanityConfigured };
