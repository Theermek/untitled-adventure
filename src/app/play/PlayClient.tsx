"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { navigateWithTransition } from "@/lib/view-transition";
import type { StoryData } from "@/lib/stories";

const START_CHAPTER = "start";

export default function PlayClient({ story }: { story: StoryData }) {
  const router = useRouter();
  const [chapterKey, setChapterKey] = useState(START_CHAPTER);
  const chapter = story.chapters[chapterKey];

  const handleReturnToMenu = () => {
    navigateWithTransition(() => router.push("/"));
  };

  return (
    <main className="stack-lg py-12">
      <div key={chapter.key} className="stack scene-enter">
        <div className="vn-frame" aria-hidden>
          <div className="flex h-full w-full items-center justify-center bg-bg-elevated text-ink-soft text-story">
            scene illustration
          </div>
        </div>

        <div className="text-narrative">
          {chapter.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {chapter.isEnding ? (
          <div className="stack-sm">
            <p className="badge badge-accent w-fit">The End</p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={handleReturnToMenu}
            >
              Return to menu
            </button>
          </div>
        ) : (
          <div className="stack-sm">
            {chapter.choices.map((choice) => (
              <button
                key={choice.next}
                className="btn btn-block"
                type="button"
                onClick={() => setChapterKey(choice.next)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
