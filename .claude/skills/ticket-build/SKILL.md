---
name: ticket-build
description: Postaví ticket schváleného zadání izolovaným subagentem (ticket-builder) a spustí review. Použij u ticketu ve stavu ready, nebo u ticketu vráceného z review či od uživatele k opravám.
argument-hint: "<id ticketu>"
---

# Ticket build

Ticket `.claude/tickets/<id>.md` musí být `ready` (první build) nebo `building` (opravné kolo po review či po vrácení od uživatele). Jinak stůj a řekni, v jakém je stavu. Povolené přechody jsou v tabulce v `CLAUDE.md`.

Sám nepíšeš ani needituješ kód a obsah, to dělá builder. Spouštěj ho na pozadí a mezitím zůstaň k dispozici uživateli.

1. Přečti soubor ticketu (Read). Je-li `ready`, změň `status:` na `building` a nastav `round: 0`.
2. Spusť subagenta `ticket-builder` s `description` začínajícím `#<id> ` (např. `#5 Build: Přidat do košíku`). Do promptu dej **jen**:
   - id, název a zadání ticketu doslova (sekce `## Kontext`),
   - kontext epicu (`.claude/tickets/epics/<epic>.md`), je-li ticket v epicu,
   - `branch` a `worktree` z ticketu, jsou-li, jinak nech default,
   - **základní větev**: hlavní větev projektu podle pravidla v `CLAUDE.md` (dočasně `feat/book-detail-print-design`, ne `main`), výslovně a včetně zákazu zakládat z `origin/main`, platí-li jiné pravidlo než `main`,
   - v opravném kole číslovaný seznam připomínek z posledního kola doslova (bloky produkt, kód i uživatel z `## Review` pro aktuální `round`), nic z úvah ani shrnutí ostatních agentů.
   Nezadávej mu postup, nesuď předem. Nezávislé tickety spouštěj paralelně, v jedné zprávě.
3. Až builder skončí, zapiš do frontmatteru ticketu `branch:` a `worktree:` z jeho odpovědi (řádek `klíč: hodnota`, chybí-li, přidej ho). Neprošly-li mu kontroly nebo oznámil otevřenou otázku, ticket nepřeposílej na review: nastav `blocked: true`, důvod napiš do `## Poznámka` a řekni to uživateli.
4. Jinak změň `status:` na `review` a zvyš `round:` o 1 (po `ready` → `building` je `round: 0`, první review je tedy kolo 1). Pokračuj skillem `ticket-review`. Builderovo shrnutí reviewerům nepředávej.
