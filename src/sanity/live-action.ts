"use server";

import { updateTag } from "next/cache";
import { CMS_CACHE_TAG } from "@/sanity/live";

/** Instantly expire cached CMS data and soft-refresh the page for open visitors. */
export async function sanityLiveUpdateAction(_unsafeTags: unknown) {
  updateTag(CMS_CACHE_TAG);
  return "refresh" as const;
}
