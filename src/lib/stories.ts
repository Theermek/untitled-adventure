import { prisma } from "@/lib/prisma";

export type ChapterChoice = {
  label: string;
  next: string;
};

export type StoryChapter = {
  key: string;
  paragraphs: string[];
  isEnding: boolean;
  choices: ChapterChoice[];
};

export type StoryData = {
  title: string;
  chapters: Record<string, StoryChapter>;
};

export async function getStoryBySlug(slug: string): Promise<StoryData | null> {
  const story = await prisma.story.findUnique({
    where: { slug },
    include: {
      chapters: {
        include: {
          outgoingChoices: {
            orderBy: { order: "asc" },
            include: { targetChapter: { select: { key: true } } },
          },
        },
      },
    },
  });

  if (!story) return null;

  const chapters: Record<string, StoryChapter> = {};
  for (const chapter of story.chapters) {
    chapters[chapter.key] = {
      key: chapter.key,
      paragraphs: chapter.paragraphs,
      isEnding: chapter.isEnding,
      choices: chapter.outgoingChoices.map((choice) => ({
        label: choice.label,
        next: choice.targetChapter.key,
      })),
    };
  }

  return { title: story.title, chapters };
}
