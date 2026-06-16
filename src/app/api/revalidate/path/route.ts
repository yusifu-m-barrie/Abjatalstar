import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CMS_CACHE_TAG } from "@/sanity/live";

type WebhookPayload = {
  _type?: string;
};

const SITE_PATHS = [
  "/",
  "/about",
  "/services",
  "/branches",
  "/contact",
  "/how-it-works",
] as const;

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      true
    );

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (!body?._type) {
      return new Response("Missing document type", { status: 400 });
    }

    revalidateTag(CMS_CACHE_TAG, { expire: 0 });
    revalidatePath("/", "layout");

    for (const path of SITE_PATHS) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      type: body._type,
      paths: SITE_PATHS,
    });
  } catch (error) {
    return new Response((error as Error).message, { status: 500 });
  }
}
