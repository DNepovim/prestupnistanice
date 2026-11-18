---
name: commit
description: Commit the current work with Conventional Commit messages — gate on the `check` suite, review content/CMS-schema changes, propose message(s) for confirmation, then create the commit(s) on the current branch. Does not push or open a PR (that is `ship`). Use when asked to commit, or when `ship` needs the commit step.
---

# Commit

Turn the working tree into one or more Conventional Commits on the **current
branch**. It never pushes, never opens a PR and never switches branches — `ship`
owns that and calls this skill for the commit step.

**Never commit without the user's explicit confirmation of the message(s).**

## Step 0 — Gate on checks

Invoke the **`check`** skill (lint, Prettier, types, Knip). It fixes what it can;
if anything can't be made green, **stop** and report — do not commit failing
checks.

Then look at what will be committed: `git status --short` and `git diff` (staged
+ unstaged). If the tree is clean, say there's nothing to commit and stop.

## Step 0b — Content check

Check whether the working tree touches editable content or the CMS schema:

```bash
git status --short src/content/ tina/
```

If files under `src/content/` changed, note in the summary that these are
TinaCMS-editable files — an editor working in TinaCloud on the `main` branch may
have concurrent changes there. Confirm with the user before overwriting content
that wasn't authored in this session.

If `tina/collections/*` changed, verify the matching Zod schema in
`src/content.config.ts` was updated too (the two schemas describe the same
files). If they've diverged, fix it before committing — the build will fail
validation otherwise.

If neither path changed, skip this step silently.

## Step 1 — Propose Conventional Commit message(s)

Read the diff and propose commit message(s) following **Conventional Commits
v1.0.0** (https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- **types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
  `ci`, `chore`, `revert`.
- `feat` → MINOR, `fix` → PATCH. Breaking change → append `!` after type/scope
  **and/or** a `BREAKING CHANGE:` footer.
- Description: imperative mood, lowercase, no trailing period, concise.
- Scope is optional and in parentheses, e.g. `feat(carousel): …`.

If the working tree contains **logically separate** changes, propose **multiple
commits** (each a coherent Conventional Commit with the files it covers) rather
than one catch-all. Otherwise propose a single commit.

Present the proposed message(s) using **`AskUserQuestion`** with these choices:

- **"Commit it"** — proceed as-is (Recommended)
- **"Edit message"** — user will type a replacement; apply it and commit
- **"Cancel"** — stop, do not commit

If the caller (e.g. `ship`) supplied extra details to confirm, such as a branch
name, include them in the same prompt. Only continue once the user picks "Commit
it" or provides an edited message. Do **not** ask in plain text — always use
`AskUserQuestion` so the session stays unblocked.

Every commit message must end with the attribution footer the session specifies
for commits (for example `Co-Authored-By: Claude <noreply@anthropic.com>`).

## Step 2 — Commit

1. Stage per commit (`git add <files>`), never `git add -A` blindly — don't pick
   up unrelated files, `.env` or Tina tokens.
2. Create each confirmed commit, in order.
3. Report the resulting commit hash(es) and subject line(s) (`git log --oneline`).

## Notes

- Don't amend or rewrite history the user didn't ask about.
- Never commit `.env` or Tina tokens.
