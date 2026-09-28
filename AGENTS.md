<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

This is a browser-based, pixel-art-styled visual novel / choice-driven adventure game.

*Life in Adventure* (Studio Wheel) is used purely as a **structural and visual reference** — typography pairing, spacing rhythm, HUD/layout composition, color language, and responsive behavior. Never source game text, art assets, or branding from it, or from any other existing game — content in this repo must be original. See `src/app/globals.css` for the resulting design tokens and reusable primitives (`.vn-shell`, `.vn-container`, `.vn-panel`, `.vn-frame`, `.btn`, `.badge`, etc.).

Game content (stories, chapters, choices, side quests) lives in Postgres via Prisma — see `CLAUDE.md`'s Architecture section for the schema and how `src/app/play` reads it. There's one placeholder example story so far and no art yet; no user accounts/save data (Better Auth is wired but has no auth methods or models configured).
