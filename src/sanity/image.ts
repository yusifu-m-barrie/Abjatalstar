import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "./client";

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export function getImageUrl(
  source: SanityImageSource | null | undefined,
  fallback = "/abjatal-star-logo.png"
): string {
  if (!source) return fallback;
  try {
    return urlFor(source).width(800).auto("format").url();
  } catch {
    return fallback;
  }
}
