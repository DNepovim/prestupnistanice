---
name: ticket-standup
description: Vypíše všechny tickety z .claude/tickets, v jaké fázi jsou, na co se čeká a co je potřeba udělat teď. Použij, když chce uživatel standup, přehled ticketů, "co máme rozdělané" nebo "co je na řadě".
---

# Ticket standup

1. Projdi `.claude/tickets/*.md` (Glob + Read; stačí frontmatter, u ticketů, které potřebují detail, i `## Poznámka` a `## Review`) a epicy v `.claude/tickets/epics/*.md`. Nic neměň.
2. Napiš česky stručný přehled. Jeden řádek na ticket, žádné úvody, prázdné skupiny vynech. Výsledek obsahuje epicy (`Epic E1: …` s kontextem a tickety) a samostatné tickety.
   - **Čeká na tebe**: tickety ve stavu `spec` (schválit zadání) a `accept` (schválit hotovou práci), tickety s `blocked: true` s důvodem z poznámky.
   - **Epicy**: `E# název · hotovo/celkem`, pod ním jeho tickety s fází.
   - **V práci**: `shaping`, `building`, `review` (u review kolo `round` a výsledky produkt/kód z bloků posledního kola), `shipping`. Subagenty znáš jen z konverzace, nevymýšlej je.
   - **Připraveno**: `ready`, čeká na build.
   - **Todo**: `queued`, jen názvy.
   - **Hotovo**: počet a názvy v jednom řádku.
3. Na konec **Teď je potřeba**: nejvýš tři kroky v tomto pořadí:
   1. co čeká na uživatele (schválení, rozhodnutí u blokovaných),
   2. co jde posunout hned (`ready` → `ticket-build`, `review` → `ticket-review`, `shipping` → `ticket-ship`),
   3. nejstarší `queued`, který stojí za shapování (`ticket-shape`).
   U každého napiš skill, kterým se pokračuje, a epic u ticketů z epicu.
4. Nejsou-li žádné tickety, napiš jen „Tickety jsou prázdné.“
