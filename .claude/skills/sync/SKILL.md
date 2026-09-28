---
name: sync
description: Check whether CLAUDE.md and AGENTS.md are still accurate given recent code changes, and update them if not. Use this whenever the user runs /sync, asks to "sync the docs", "update CLAUDE.md", or after a chunk of work that plausibly changed architecture, dependencies, commands, or project context — but only actually edit the files when something doc-worthy really changed; most runs should be a no-op.
---

# Sync project docs

`CLAUDE.md` and `AGENTS.md` describe this project's commands and big-picture
architecture for future agents. Code drifts from docs constantly; this skill
is the deliberate check-in that catches it — but it must stay boring and
cheap to run, or nobody will run it. Bias hard toward doing nothing.

## 1. Find what's changed

Find the last commit that touched either doc file, then look at everything
since (committed and not):

```bash
git log -1 --format=%H -- CLAUDE.md AGENTS.md
git diff <that-commit>..HEAD --stat
git status --short
git diff HEAD
```

If neither file has ever been committed, treat the repo's first commit as
the baseline instead.

## 2. Decide if any of it is doc-worthy

Read the diff for signals that would change something *already asserted* in
CLAUDE.md/AGENTS.md, or that fills a real gap in them — not just "code was
written". Concretely, look for:

- `package.json` — new major dependency, removed dependency, changed/renamed
  script (the Commands section lists exact script names)
- New or changed config that alters how the project is built/run/connected
  (e.g. a new ORM, a new datasource, a new auth setup, a new build tool)
- A new top-level module/directory under `src/` (or wherever the app lives)
  that represents a new architectural concern, not just a new file inside an
  already-documented one
- Env vars added, removed, or renamed (check `.env.example` if present)
- Anything that contradicts a specific claim currently in the docs (e.g. a
  section says "no models yet" and models now exist; a section says
  "unconfigured" and it's now configured)

Do **not** count as doc-worthy: routine feature/content work inside an
already-documented architecture, styling tweaks, copy changes, test
additions, dependency patch bumps, refactors that don't change the shape of
anything, or new files that are just more instances of a pattern the docs
already describe.

If nothing clears that bar: say so plainly — e.g. "Nothing to sync — CLAUDE.md
and AGENTS.md still match the current project." — and stop. Do not edit
either file just to have done something.

## 3. If something qualifies, make the smallest accurate edit

Open both files and see how they currently divide responsibility before
touching anything — that division can evolve, but changes to it should be
deliberate, not a side effect of an unrelated doc update:

- `AGENTS.md` — shared project/context description (what this project *is*),
  consumed by any coding agent. `CLAUDE.md` imports it verbatim via `@AGENTS.md`.
- `CLAUDE.md` — commands, and Claude-specific "big picture" architecture notes
  (the kind of thing that takes reading multiple files to piece together).

Match whichever file the change belongs to, and match its existing structure,
tone, and heading style — extend a section or add one sibling section, don't
reorganize what's already there as a side effect.

Hold the line on the same constraints these files were written under:

- No "Common Development Tasks", "Tips", "Support" or other invented
  sections — only document things actually verified from the repo.
- Don't enumerate every file or component; only note structure that isn't
  obvious from opening the repo and reading filenames.
- Don't restate anything already obvious from the code itself.
- If a section's claims are now simply wrong (not just incomplete), correct
  them in place rather than appending a caveat next to the stale text.

## 4. Report

End with a short summary: either "nothing to sync" with a one-line reason,
or exactly which file(s) changed and why — so the user can see the diff was
deliberate, not padding.
