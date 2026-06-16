import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../../sanity/env";

export const client = createClient({  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

export { isSanityConfigured };
