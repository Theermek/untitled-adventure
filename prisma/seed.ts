/**
 * Seeds the placeholder example story used to exercise the scene/choice/
 * ending flow. Original content, written to test the mechanics — not final
 * game writing. Mirrors what used to live in src/game/story.ts.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.story.deleteMany({ where: { slug: "wanderers-tale" } });

  await prisma.story.create({
    data: {
      slug: "wanderers-tale",
      title: "Wanderer's Tale",
      summary: "A short, choice-driven story about a ferry crossing at night.",
      chapters: {
        create: [
          {
            key: "start",
            paragraphs: [
              "The old ferry groans against the dock as you step aboard, the last passenger before it pulls away.",
              "An elderly boatman studies your face for a moment too long. “Storm’s coming,” he says, nodding toward the dark clouds gathering over the strait. “You still want to cross?”",
            ],
          },
          {
            key: "crossing",
            paragraphs: [
              "You nod, and he pushes off without another word.",
              "Halfway across, the wind turns hard and cold, and the ferry pitches beneath you. The boatman fights the tiller in silence, and somewhere past the spray you think you see a second light on the water — too steady to be a wave.",
            ],
          },
          {
            key: "wait",
            isEnding: true,
            paragraphs: [
              "You climb back onto the dock as the boatman ties off the ferry for the night. The storm breaks an hour later, rattling the shutters of the inn where you take a room.",
              "By morning, the strait is calm and glassy, as if the storm had never come at all. The boatman waits by the ferry with a second cup of tea, and doesn't ask why you're smiling.",
              "Some crossings are worth losing a night's sleep to avoid rushing.",
            ],
          },
          {
            key: "ending_light",
            isEnding: true,
            paragraphs: [
              "“Hello?” Your voice barely carries over the wind. For a moment nothing answers — then the light dips low, once, like a nod, and vanishes beneath the waves.",
              "The boatman says nothing about it, and neither do you. By the time you reach the far shore, you've almost convinced yourself you imagined it. Almost.",
            ],
          },
          {
            key: "ending_shore",
            isEnding: true,
            paragraphs: [
              "You grip the rail and say nothing, watching the light drift past off the stern, steady even as the ferry lurches. It never gets any closer, and it never quite goes away either.",
              "The far shore appears out of the dark all at once. You step off without looking back, and the strait keeps whatever it was to itself.",
            ],
          },
        ],
      },
    },
  });

  const story = await prisma.story.findUniqueOrThrow({
    where: { slug: "wanderers-tale" },
    include: { chapters: true },
  });
  const chapterIdByKey = new Map(story.chapters.map((c) => [c.key, c.id]));

  const choice = (chapterKey: string, label: string, order: number, targetKey: string) => ({
    chapterId: chapterIdByKey.get(chapterKey)!,
    label,
    order,
    targetChapterId: chapterIdByKey.get(targetKey)!,
  });

  await prisma.choice.createMany({
    data: [
      choice("start", "Yes. It has to be tonight.", 0, "crossing"),
      choice("start", "Wait it out onshore.", 1, "wait"),
      choice("crossing", "Call out to the light.", 0, "ending_light"),
      choice("crossing", "Say nothing, and hold on.", 1, "ending_shore"),
    ],
  });

  console.log(`Seeded story "${story.title}" with ${story.chapters.length} chapters.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
