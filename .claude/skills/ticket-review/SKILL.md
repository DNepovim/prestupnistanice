---
name: ticket-review
description: Spustí dvě nezávislé review ticketu ve stavu review (produktové a kódové), zapíše výsledky do souboru ticketu a podle nich ticket postoupí k schválení, nebo ho vrátí builderovi. Při schvalování hotové práce zajistí náhled a dotaz na uživatele.
argument-hint: "<id ticketu>"
---

# Ticket review

Review sám neděláš, spouštíš oba reviewery na pozadí a mezitím zůstaň k dispozici uživateli. Povolené přechody jsou v tabulce v `CLAUDE.md`.

1. Přečti `.claude/tickets/<id>.md`. Ticket musí být ve stavu `review`; `round:` je číslo aktuálního kola N.
2. V jedné zprávě spusť dva subagenty, každého s `description` začínajícím `#<id> `:
   - `ticket-product-reviewer` (produktové review),
   - `ticket-code-reviewer` (review kódu).
   Do promptu každého dej **jen**: id a název, zadání doslova (`## Kontext`), `branch`, `worktree` a základní větev (hlavní větev projektu podle `CLAUDE.md`, jinak `origin/main`), a ve druhém a dalším kole **jeho vlastní** připomínky z předchozího kola doslova (blok `### Kolo N-1 · produkt` / `· kód` z `## Review`; u produktového reviewera i blok `· uživatel` z posledního vrácení) s pokynem ověřit u každé, zda je vyřešená. Nepředávej builderovo shrnutí, `## Poznámka`, připomínky druhého reviewera ani svůj názor. Každý agent musí mít izolovaný kontext.
3. Až se oba vrátí, připiš do `## Review` ticketu (sekci vytvoř, chybí-li; nové bloky na konec) pro každého blok:

   ```
   ### Kolo N · produkt · pass
   
   <jeho odpověď doslova>
   ```
   (`produkt` / `kód`, verdikt `pass` / `changes` přesně podle jeho VERDIKTU, N = `round`). Pak změň `status:`:
   - obě `pass` → `accept`,
   - aspoň jedno `changes` → `building` (`round` se nemění, zvýší se až při příštím přechodu na `review`).
4. Při `building` pokračuj skillem `ticket-build` (opravné kolo; builder dostane připomínky z obou reviewů). Po třetím kole, které se stále vrací (`round` ≥ 3 a opět `changes`), zastav, nastav `blocked: true`, důvod do `## Poznámka` a nech rozhodnout uživatele.
5. Při `accept`:
   1. U změny, kterou uživatel posuzuje očima (vzhled, barvy, komponenta, stránka), nejdřív **rozjeď náhled**: ve worktree ticketu už jsou nainstalované závislosti od buildera (nikdy nesymlinkuj `node_modules` z hlavního checkoutu; chybí-li, `pnpm install` přímo ve worktree), zkopíruj gitignorované soubory potřebné ke spuštění (např. `.env`) z hlavního checkoutu (necommituj), spusť `pnpm exec astro dev --port <volný port> --host 127.0.0.1` na pozadí (běžící `pnpm dev` hlavního checkoutu obsazuje svůj port), ověř `curl`em, že stránka odpovídá 200 a obsahuje změnu.
   2. **Zapiš do ticketu sekci `## Náhled`** (povinná, bez ní se dál nejde): **kde to uživatel najde** (konkrétní adresy, soubory) a **jak to má otestovat** (číslované kroky, co má vidět). U změny bez vizuálu napiš, který soubor nebo diff si má otevřít a co v něm hledat.
   3. Shrň uživateli hotovou práci: co ticket dělá, kolik kol review proběhlo, výsledky obou reviewerů (drobnosti uveď), `git log --oneline <základní větev>..<větev>` s commit zprávami a výsledek kontrol, a znovu obsah `## Náhled` (adresa a kroky).
   4. **Výslovně napiš, že se schvaluje HOTOVÁ IMPLEMENTACE ticketu #<id> „<název>“** (ne zadání a ne design) a že se po schválení pošle do cílové větve včetně uvedených commit zpráv. Zeptej se (`AskUserQuestion` s volbami „Schvaluji“ / „Upravit“, nebo prostý text) a **počkej na odpověď**. Za uživatele ji neschvaluj.
   5. Odpověď „schvaluji“: změň `status:` na `shipping`. Vrácení s komentářem: připiš blok `### Kolo N · uživatel · changes` s komentářem doslova do `## Review`, změň `status:` na `building` a pokračuj `ticket-build`.
   6. Po schválení nebo vrácení zastav náhledový server (TaskStop), než se worktree uklidí.
