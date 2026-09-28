"use client";

import { useRouter } from "next/navigation";
import { navigateWithTransition } from "@/lib/view-transition";

export default function MainMenu() {
  const router = useRouter();

  const handleStart = () => {
    navigateWithTransition(() => router.push("/play"));
  };

  return (
    <main className="stack-lg flex flex-1 flex-col justify-center py-12">
      <header className="stack-sm text-center">
        <p className="badge badge-accent mx-auto w-fit">Untitled Adventure</p>
        <h1>Wanderer&apos;s Tale</h1>
        <p className="text-ink-muted text-sm">
          A short, choice-driven story.
        </p>
      </header>

      <nav className="stack-sm" aria-label="Main menu">
        <button
          className="btn btn-primary btn-block"
          type="button"
          onClick={handleStart}
        >
          Start a New Adventure
        </button>
        <button className="btn btn-block" type="button" disabled>
          Continue
        </button>
        <button className="btn btn-block" type="button" disabled>
          Settings
        </button>
        <p className="text-ink-soft text-center text-xs">
          Continue and Settings are coming soon.
        </p>
      </nav>
    </main>
  );
}
