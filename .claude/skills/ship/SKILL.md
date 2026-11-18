---
name: ship
description: Ship the current work — commit it with the `commit` skill (which runs the `check` suite first), then (default) open a GitHub PR from a new branch, or (`ship prod`) push straight to main. Use when finishing a piece of work and you want it committed / PR'd / shipped. Argument, `prod`, controls the mode.
---

# Ship

Two modes:

- **`ship`** (no argument) → ask the user whether to open a branch + PR or commit directly to `main`.
- **`ship prod`** → skip the question and commit directly to `main`.

`ship` is `commit` plus publishing. The checks, content review and Conventional
Commit confirmation all live in the **`commit`** skill; this skill adds the
branch, the push and the PR. **Never push or open a PR without the user's
explicit confirmation of the commit message(s) — and, for the branch flow, the
branch name.**

## Step 0 — Choose ship mode (only when invoked as plain `ship`)

Ask the user using **`AskUserQuestion`**:

- **"Branch + PR"** — create a new branch, commit, push, open a GitHub PR. (Recommended)
- **"Commit to main"** — commit and push directly to `main` (same as `ship prod`).

Use the answer to determine which Step 2 path to follow.

## Step 1 — Commit

Invoke the **`commit`** skill. It runs the `check` suite, reviews content/schema
changes, and asks the user to confirm the Conventional Commit message(s) before
creating them.

- In **branch mode**, first suggest a branch name `<type>/<kebab-summary>` (e.g.
  `feat/book-carousel`, `fix/author-tooltip`) derived from the change, and hand
  it to `commit` so it is part of the same confirmation prompt.
- In **branch mode**, if on the default branch (`main`), create and switch to the
  confirmed branch (`git checkout -b <branch>`) **before** committing — this
  carries the uncommitted changes with it.
- If `commit` stops (failing checks, clean tree, user cancels), stop `ship` too.

## Step 2 — Publish

### Default (`ship`, no arg): branch + PR

1. Push: `git push -u origin <branch>`.
2. Open the PR with `gh pr create --base main --head <branch> --title "<conventional title>" --body "<short summary of what & why>"`.
3. Report the PR URL, and note that Vercel will build a preview deployment for
   the branch.

### `ship prod`: push to main

1. Ensure the commit(s) are on `main` (check it out before committing if not).
2. `git push origin main`.
3. **Note to the user:** `main` is the production branch on Vercel *and* the
   branch TinaCMS writes to (`tina/config.ts` → `branch: 'main'`). Pushing
   `main` deploys to production.

## Notes

- Remote is `git@github.com:DNepovim/prestupnistanice-tina-astro.git`.
- Use `gh` for the PR; if `gh` isn't authenticated, tell the user to run
  `gh auth login` (as a `! gh auth login` prompt) rather than failing silently.
- Don't touch unrelated files or amend history the user didn't ask about.
- Never commit `.env` or Tina tokens.
