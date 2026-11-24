---
name: ticket-shape
description: Shapování ticketu. Doplní kontext, rozhodne s uživatelem, co přesně se staví, a zapíše zadání s akceptačními kritérii do souboru ticketu. Použij, když uživatel chce začít pracovat na ticketu ve stavu queued, nebo řekne "shape" nebo "pojďme to rozmyslet".
argument-hint: "<id ticketu>"
---

# Ticket shape

Tickety jsou soubory `.claude/tickets/<id>.md`, epicy `.claude/tickets/epics/<id>.md` (formát a tabulka povolených přechodů jsou v oddílu „Pracovní postup s tickety“ v `CLAUDE.md`). Soubory čti nástrojem Read a měň nástrojem Edit. Změnu `status:` ve frontmatteru piš hned, jak nastane.

Shapuj jen ticket, který uživatel výslovně spustil (nebo který tě podle pravidla o volné kapacitě čeká jako další v backlogu). Nový ticket zůstává `queued`, dokud se do něj nepustíš.

Shapování řídí hlavní chat, protože potřebuje rozhodnutí uživatele, ale sám nic nezkoumá ani nekreslí: průzkum a tvorbu návrhů delegují subagenti (kroky 2 a 3), ty jen vedeš dialog a zapisuješ zadání. Výsledkem je zadání, které pak postaví builder bez dalších dotazů a které reviewer umí zkontrolovat.

1. Přečti `.claude/tickets/<id>.md`. Je-li v něm `epic: N`, přečti `.claude/tickets/epics/N.md`. Ticket musí být `queued` (nebo `shaping` při vrácení zadání); jinak řekni, v jakém je stavu, a stůj. Změň `status: queued` na `status: shaping`.
2. Zjisti, co potřebuješ vědět: `CLAUDE.md`, příslušné části kódu, související tickety. Průzkum repa a okolních ticketů dej subagentovi `Explore` s úzkou otázkou, na pozadí, výsledek použij jako podklad, ne jako hotové rozhodnutí. Čtení pár souborů si můžeš udělat sám, cokoli většího deleguj.
3. Ptej se uživatele jen na to, co z kódu a kontextu nepoznáš: rozsah, chování, vzhled, hranice, data. Používej `AskUserQuestion`, ke každé otázce dej doporučenou volbu; víc otázek v jednom dotazu, ne po jedné. U UI ticketů s otevřeným vzhledem nech vytvořit návrhy skillem `design-variants`: sám je nestavíš. Napiš společný brief do souboru, připrav sdílený základ a rozděl varianty mezi víc agentů `ticket-designer` (každý své varianty a soubory, souběžně na pozadí). Výsledek poskládej do jednoho artefaktu, **rozjeď ho (publikuj) a dej uživateli odkaz**, výslovně napiš, že se vybírá **design** (varianta), a nech ho vybrat.
4. Zapiš zadání do souboru ticketu do sekce `## Kontext` (Edit; sekci vytvoř, chybí-li, před `## Poznámka`/`## Náhled`/`## Review`). Česky, stručně, formátovaný Markdown, ne hustý odstavec. Podnadpisy píšeš jako `###`, protože `##` jsou sekce souboru. Struktura:
   - **### Cíl**: jedna až dvě věty, proč a co.
   - **### Rozsah**: co se udělá.
   - **### Mimo rozsah**: co se výslovně nedělá.
   - **### Akceptační kritéria**: číslovaný seznam, každé ověřitelné čtením kódu nebo diffu (ne „vypadá hezky“). Přesně podle nich kontroluje product review.
   - **### Rozhodnutí**: co jsme s uživatelem zvolili a proč.
   - **### Dotčené části**: soubory, komponenty, schémata (včetně obou schémat obsahu, když se mění).
   - **### Rizika a otevřené otázky**: jen skutečné.
   Rozhodnutí platná pro celý epic přidej i do `.claude/tickets/epics/N.md` (sekce `## Kontext`).
5. Změň `status:` na `spec` a **předlož uživateli celé zadání v chatu přehledně naformátované** (nadpisy, číslovaný seznam kritérií, tučně to podstatné), ne shrnutí a nikdy ne surový text souboru. V téže zprávě **výslovně napiš, že se schvaluje ZADÁNÍ** (ne design a ne implementace), a že je zapsané v `.claude/tickets/<id>.md`. Pak se zeptej (`AskUserQuestion` s volbami „Schvaluji“ / „Upravit“, nebo prostý text) a **počkej na odpověď**. Za uživatele ho neschvaluj, mlčení ani nejasná odpověď schválením není.
   - Odpověď „schvaluji“ (nebo jednoznačně rovnocenná): změň `status:` na `ready`.
   - Vrácení s komentářem: změň `status:` na `shaping`, komentář zapiš do `## Poznámka`, uprav zadání a opakuj krok 5.
6. Po schválení se nic nestaví samo. Řekni, že ticket je `ready`, a nabídni `ticket-build`. (Je-li volná kapacita, pokračuje se podle pravidla v `CLAUDE.md`.)
