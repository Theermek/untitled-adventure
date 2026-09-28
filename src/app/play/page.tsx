import { notFound } from "next/navigation";
import { getStoryBySlug } from "@/lib/stories";
import PlayClient from "./PlayClient";

// Prisma reads aren't visible to Next's fetch-cache heuristics, so without
// this the route gets prerendered once at build time and never re-reads
// the database — the opposite of the point of moving content into it.
export const dynamic = "force-dynamic";

const DEFAULT_STORY_SLUG = "wanderers-tale";

export default async function Play() {
  const story = await getStoryBySlug(DEFAULT_STORY_SLUG);
  if (!story) notFound();

  return <PlayClient story={story} />;
}
