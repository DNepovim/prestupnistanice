---
name: ticket-ship
description: Pošle schválenou hotovou práci ticketu do hlavní větve projektu (dočasně feat/book-detail-print-design, jinak rovnou do main, bez MR) a uklidí worktree. Použij u ticketu ve stavu shipping. Nezaměňovat se skillem ship (commit + PR/push).
argument-hint: "<id ticketu>"
---

# Ticket ship

Ticket `.claude/tickets/<id>.md` musí být `shipping`, tedy hotová práce je schválená uživatelem v chatu. Jinak stůj. (Skill `ship` projektu je jiná věc: commituje a otvírá PR; tady se posouvá už hotová větev ticketu bez MR.)

Nejdřív zastav případný náhledový server běžící ve worktree ticketu (TaskStop), drží soubory. Git kroky sám neděláš, deleguj je na subagenta `ticket-shipper` na pozadí s `description` začínajícím `#<id> `. Do promptu dej jen: id a název ticketu, `branch` a `worktree` z ticketu, základní větev a cíl shipu (default `origin/main` a push do `main`; podle pravidla v `CLAUDE.md` je dočasně základem i cílem lokální větev bez remote `feat/book-detail-print-design`, která se posune fast-forwardem, bez pushe) a upozornění, že commit zprávy už uživatel odsouhlasil při schválení. Mezitím zůstaň k dispozici uživateli.

Až agent skončí:
- Odpověděl-li, že je práce v cíli a uklizeno, změň `status:` na `done` a do `## Poznámka` napiš hash commitu z jeho odpovědi.
- Hlásí-li konflikt při rebase nebo selhání kontrol, změň `status:` na `building`, jeho výpis napiš do `## Poznámka` a řekni to uživateli.
