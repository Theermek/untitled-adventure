# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server (Turbopack) at localhost:3000
npm run build         # production build
npm run start         # run the production build
npm run lint          # eslint (flat config: eslint-config-next core-web-vitals + typescript)

npm run db:generate   # regenerate the Prisma client after editing prisma/schema.prisma
npm run db:push       # push schema changes to the database without creating a migration
npm run db:migrate    # create and apply a migration (prisma migrate dev)
npm run db:studio     # open Prisma Studio
npm run db:seed       # re-run prisma/seed.ts (drops and re-inserts the "wanderers-tale" story)
```

There is no test runner configured in this project yet.

## Architecture

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4, with Prisma ORM 7 (Postgres, hosted on Neon) and Better Auth. The `@/*` import alias maps to `./src/*`.

**Prisma uses the v7 driver-adapter architecture, not the legacy built-in connection handling.** The Prisma Client is never instantiated with a bare connection string — it always takes an explicit driver adapter:

- The client is generated to `src/generated/prisma` (gitignored, regenerate with `npm run db:generate` after any schema change) rather than `node_modules/.prisma`.
- CLI commands (`db:push`, `db:migrate`, `db:studio`) read `DATABASE_URL` via `prisma7.config.ts` (not `schema.prisma`), which loads `.env` through `dotenv`. **Don't add `url = env("DATABASE_URL")` to the `datasource` block in `schema.prisma`** — Prisma 7 rejects that as a validation error now that the URL lives in `prisma7.config.ts`; the datasource block should only ever declare `provider`.
- At runtime, `src/lib/prisma.ts` builds a `PrismaPg` adapter (`@prisma/adapter-pg` + `pg`) from `DATABASE_URL` and passes it to `PrismaClient`. Import the shared client from there — don't instantiate `PrismaClient` elsewhere, since the dev-mode singleton on `globalThis` is what prevents exhausting connections across Next.js hot reloads.

**Content model — Story / Chapter / Choice / SideQuest** (`prisma/schema.prisma`): a `Story` has many `Chapter`s and many `SideQuest`s. Each `Chapter` has `paragraphs String[]` (a native Postgres array, no join table) and `isEnding Boolean`; branching is real rows in `Choice` (`chapterId` → source, `targetChapterId` → another `Chapter`), not a stringly-typed field — the DB enforces that a choice always points at a chapter that exists. The chapter with `key: "start"` is a story's entry point by convention (there's no `Story.startChapterId` FK — kept simple deliberately). `SideQuest` is intentionally flat/single-node for now (no choices of its own); it exists as a real table but isn't linked from `Chapter` yet.

- `prisma/seed.ts` — inserts the one example story ("wanderers-tale"); run via `npm run db:seed` (needs its own `import "dotenv/config"` since `tsx` doesn't load `.env` the way the Prisma CLI does).
- `src/lib/stories.ts` — `getStoryBySlug(slug)`, the only read path into this data; it reshapes the Prisma result into a `{ [chapterKey]: Chapter }` map.
- `src/app/play/page.tsx` is an async Server Component (`export const dynamic = "force-dynamic"` — a raw Prisma call gives Next's fetch-cache heuristics nothing to key off, so without this the route gets prerendered once at build time and never re-reads the database) that calls `getStoryBySlug` and renders `src/app/play/PlayClient.tsx`, which holds the actual interactive state (current chapter, choice clicks, the ending screen). The story slug is currently hardcoded (`DEFAULT_STORY_SLUG` in `page.tsx`) since there's only one story and no story-picker UI yet.

**Better Auth is wired but unconfigured** — no sign-in methods (email/password, OAuth, etc.) are enabled and no auth-related Prisma models exist:

- `src/lib/auth.ts` — the server `betterAuth()` instance, using `@better-auth/prisma-adapter`'s `prismaAdapter(prisma, { provider: "postgresql" })` against the shared Prisma client.
- `src/lib/auth-client.ts` — the `better-auth/react` client for use in client components.
- `src/app/api/auth/[...all]/route.ts` — catch-all route handler (`toNextJsHandler`) that Better Auth needs mounted at `/api/auth/*`.
- Before auth actually works: add at least one auth method to `src/lib/auth.ts`, add Better Auth's required models to `prisma/schema.prisma` (the CLI can generate these), run `db:push`/`db:migrate`, and set `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` in `.env`.

**Environment variables** are documented in `.env.example` (tracked in git; `.env` itself is gitignored except for `.env.example`, via the `!.env.example` exception in `.gitignore`): `DATABASE_URL` (Neon Postgres connection string — use the pooled `-pooler` string for the app; fall back to Neon's direct connection string only if `prisma migrate` has trouble over the pooler), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`.

`package.json` has an `overrides` block pinning `mysql2` and `deepmerge-ts` to patched versions — these are transitive deps pulled in by Prisma/Better Auth (unused, since this project is Postgres-only) that had known high-severity advisories at their default resolved versions. Keep the overrides in sync if Prisma/Better Auth are upgraded and `npm audit` flags them again.

## Design System

`src/app/globals.css` defines the entire visual language as CSS custom properties, mapped into Tailwind's utility namespace via `@theme inline` (Tailwind v4's CSS-first config — there is no `tailwind.config.ts`).

- **Colors** — semantic tokens only: raw `--vn-*` values feed `--color-bg/bg-elevated/surface/ink/ink-muted/ink-soft/border/border-soft/accent/accent-strong/accent-ink/success/danger/info`, each redefined under `prefers-color-scheme: dark`. Use these (`bg-bg`, `text-ink`, `border-border`, `bg-accent`, `badge-success`, etc.) instead of Tailwind's default palette (`bg-red-500`, ...) for anything product-facing, so light/dark mode stays consistent for free.
- **Typography** — `font-serif` (Lora, loaded in `src/app/layout.tsx`) for narrative/story text via `.text-narrative`; `font-ui` (Baloo 2) for everything else — headings, buttons, labels, badges. Custom fluid sizes `text-story` / `text-heading-sm|md|lg` live alongside (not overriding) Tailwind's default `text-*` scale.
- **Primitives** (`@layer components` in `globals.css`) — `.vn-shell`/`.vn-container` (the app frame: full-bleed on mobile, a centered bordered "screen" at `≥ 64rem`), `.stack`/`.cluster` (gap-based flex composition), `.vn-panel`/`.vn-frame` (bordered cards and fixed-ratio illustration boxes), `.btn`/`.btn-primary`/`.btn-ghost` (chunky offset-shadow buttons that compress on `:active`), `.badge` + `-accent`/`-success`/`-danger`/`-info` variants (HUD-style stat pills), `.link`, `.divider`. Build new UI from these rather than one-off Tailwind utility soup, so the small-radius, hard-border, offset-shadow "pixel RPG" chrome stays consistent across the app.
- `src/app/page.tsx` (main menu) and `src/app/play/PlayClient.tsx` (the story screen) are the two real uses of these primitives so far — treat them as the reference for how new screens should be composed, not as one-off pages.
