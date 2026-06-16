import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";
import { apiVersion, dataset, projectId } from "../../sanity/env";

const liveClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

const readToken =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;

/** Shared cache tag — invalidated on publish via webhook and live events. */
export const CMS_CACHE_TAG = "cms";

export const { SanityLive } = defineLive({
  client: liveClient,
  serverToken: readToken ?? false,
  browserToken: readToken ?? false,
});
