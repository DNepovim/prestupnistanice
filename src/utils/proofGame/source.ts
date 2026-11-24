export const PROOF_SOURCE: readonly (readonly string[])[] = [
  [
    'h|I. Zrcadlo strany',
    'g|',
    'f|Sazeč začíná tím, že si vyměří zrcadlo',
    'm|strany. Je to plocha, kterou smí zaplnit',
    'm|text. Kolem ní zůstává bílé pole, kterému',
    'm|se říká okraje. Čtenář je obvykle nevidí,',
    'm|ale poznal by, kdyby chyběly. Dobrá ⟦d1|saz-⟧',
    'm|⟦d1|ba⟧ se pozná podle toho, že se o ní vůbec',
    'e|⟦d2|nemluví. Nikdo nic nenamítá.⟧',
    'f|Korektor čte jinak než čtenář. Nejde mu',
    'm|o děj, ale o písmena, čárky a mezery mezi',
    'm|slovy. Čte pomalu, někdy dokonce ⟦e16|pozp*á*tku,⟧',
    'm|aby se nenechal strhnout příběhem. Každý',
    'm|text pročítá nejméně ⟦e15|dvakrát ,⟧ a pokaždé',
    'e|hledá ⟦e14|něco  jiného,⟧ a proto čte znovu.',
    'f|Česká sazba zná pravidla, která platí',
    'm|odnepaměti. Řádek se například nemá končit',
    'm|jednopísmennou předložkou, protože by se',
    'm|četla zvlášť. Přesto se občas stane, ⟦e4|že se k⟧',
    'm|slovu nepřipojí a zůstane na konci řádku.',
    'm|Čtenář si toho nevšimne, ale korektor ano.',
    'e|To je celý rozdíl mezi ⟦d4|nimi…⟧',
    'f|Totéž platí o dělení slov. Sazeč dělí podle',
    'm|slabik a nikdy tak, aby na řádku zůstalo',
    'm|jediné písmeno. Poslední slovo odstavce se',
    'm|také nemá dělit. Tady se to nepovedlo, takže',
    'm|se tento odstavec zakončil slovem ⟦e3|rozdě-⟧',
    'e|⟦e3|leným.⟧',
    'f|Zrcadlo ovšem není jen obdélník na papíře.',
    'm|Určuje rytmus celé knihy, protože se podle',
  ],
  [
    'e|⟦e1|něj řídí všechny další strany.⟧',
    'u|⟦e17|Mezery mezi slovy mají být stejně široké,⟧',
    'm|jinak se text rozpadá na světlé a tmavé',
    'm|pruhy. Nejhorší to bývá v úzkém sloupci.',
    'm|⟦e8|Tehdy se mezery rozevřou.⟧',
    'm|Čtenář pak nečte slova, ale hledá cestu',
    'e|mezi ⟦e9|mezerami - a⟧ to je únavné.',
    'f|⟦e7|Nejhůř působí žebříček, tedy několik řádků⟧',
    'm|⟦e7|pod sebou, které všechny končí zlome-⟧',
    'm|⟦e7|ným slovem. Oko pak poskakuje po okra-⟧',
    'm|⟦e7|ji a hledá, kde které slovo vlastně pokra-⟧',
    'm|⟦e7|čuje. Taková sazba čtenáře rychle unavu-⟧',
    'm|je. Sazeč proto dělení hlídá a nenechá ⟦e5|je v⟧',
    'e|řadě narůst nad tři řádky.',
    'f|Pozor je třeba dávat i na čísla. Náklad',
    'm|první edice činil podle zápisu přesně ⟦e12|2⟧',
    'm|⟦e12|000⟧ výtisků, tisk příloh stál ⟦d6|10~000~Kč.⟧',
    'm|Zkratky se píší s tečkou a od čísla se',
    'm|nesmějí oddělit, jak je vidět ve sborníku ⟦e13|č.⟧',
    'e|⟦e13|5⟧ z minulého roku, na stranách ⟦d7|40–46.⟧',
    'f|Uvozovky se v češtině píší dole a nahoře,',
    'm|jak je vidět u slova ⟦d3|„sazba“.⟧ Rovné ⟦e10|"takto"⟧',
    'm|jsou prý z psacího stroje. Také výpustka je',
    'm|jediný znak, a ne tři ⟦e11|tečky...⟧ Horší je',
    'm|ovšem oddělit jediné písmeno slova, třeba ⟦e6|o-⟧',
    'm|⟦e6|kno,⟧ které se pak ztratí na dalším řádku.',
    'm|Když je vše v pořádku, čtenář se může ⟦d5|po-⟧',
    'e|⟦d5|hodlně⟧ opřít a nevšímat si ničeho.',
    'f|⟦e2|Korektor to ovšem vidí jinak. Chyba je⟧',
  ],
]

export const PROOF_ERROR_DEFINITIONS = [
  {
    id: 'e1',
    tag: 'vdova',
    description: 'Poslední řádek odstavce osamocený nahoře na straně se jmenuje vdova.',
  },
  {
    id: 'e2',
    tag: 'sirotek',
    description: 'První řádek odstavce osamocený dole na straně se jmenuje sirotek.',
  },
  {
    id: 'e3',
    tag: 'dělené poslední slovo',
    description:
      'Poslední slovo odstavce se nemá lámat na dva řádky, na posledním řádku zbyl jen kousek slova.',
  },
  {
    id: 'e4',
    tag: 'předložka na konci řádku',
    description:
      'Jednopísmenná předložka nebo spojka nesmí zůstat na konci řádku, patří ke slovu za ní.',
  },
  {
    id: 'e5',
    tag: 'předložka na konci řádku',
    description:
      'Jednopísmenná předložka nebo spojka nesmí zůstat na konci řádku, patří ke slovu za ní.',
  },
  {
    id: 'e6',
    tag: 'špatné dělení',
    description: 'Slovo se nesmí dělit tak, aby na řádku zůstalo jediné písmeno.',
  },
  {
    id: 'e7',
    tag: 'žebříček',
    description:
      'Čtyři řádky po sobě končící rozdělením slova tvoří žebříček, dělení se nemá opakovat víc než třikrát.',
  },
  {
    id: 'e8',
    tag: 'volný řádek',
    description: 'Řádek s příliš málo slovy má roztažené mezery, text se rozpadá.',
  },
  {
    id: 'e9',
    tag: 'spojovník místo pomlčky',
    description:
      'Pomlčka je delší než spojovník a píše se půlčtverčíkovou čárkou s mezerami po stranách.',
  },
  {
    id: 'e10',
    tag: 'rovné uvozovky',
    description: 'Česky se uvozovky píší dole a nahoře, rovné anglické do textu nepatří.',
  },
  {
    id: 'e11',
    tag: 'tři tečky',
    description: 'Výpustka je jediný znak, ne tři tečky za sebou.',
  },
  {
    id: 'e12',
    tag: 'rozdělené číslo',
    description: 'Číslo a jeho tisíce patří na jeden řádek.',
  },
  {
    id: 'e13',
    tag: 'zkratka bez čísla',
    description: 'Zkratka se od čísla, ke kterému patří, na řádku neodděluje.',
  },
  { id: 'e14', tag: 'dvojitá mezera', description: 'Mezi slovy má být jediná mezera.' },
  { id: 'e15', tag: 'mezera před čárkou', description: 'Před čárkou se mezera nedělá.' },
  {
    id: 'e16',
    tag: 'cibulák',
    description: 'Jedno písmeno ve slově je z jiného písma, tomu se říká cibulák.',
  },
  {
    id: 'e17',
    tag: 'chybí odsazení',
    description: 'První řádek odstavce nemá odsazení, ostatní odstavce ho mají.',
  },
] as const

export const PROOF_DECOY_DEFINITIONS = [
  {
    id: 'd1',
    tag: 'správné dělení',
    description:
      'Dělení „saz-ba“ je v pořádku: lomí se na slabice a na obou stranách zbývají aspoň dvě písmena.',
  },
  {
    id: 'd2',
    tag: 'krátký poslední řádek',
    description:
      'Krátký poslední řádek odstavce chybou není, stojí na něm víc než jedno slovo.',
  },
  {
    id: 'd3',
    tag: 'české uvozovky',
    description: 'České uvozovky „ “ jsou přesně takhle správně.',
  },
  {
    id: 'd4',
    tag: 'výpustka',
    description: 'Jeden znak výpustky je správně, chybou by byly až tři tečky.',
  },
  {
    id: 'd5',
    tag: 'dělení na slabice',
    description:
      '„po-“ je jen začátek slova „pohodlně“, rozdělený na slabice, ne předložka.',
  },
  {
    id: 'd6',
    tag: 'číslo pohromadě',
    description: '„10 000 Kč“ stojí celé na jednom řádku, tak se to má.',
  },
  {
    id: 'd7',
    tag: 'správná pomlčka',
    description: 'Pomlčka v rozsahu „40–46“ je půlčtverčíková, takhle je to v pořádku.',
  },
] as const

export const PROOF_FIRST_PAGE_NUMBER = 14

export const PROOF_RUNNING_HEADS = [
  ['O sazbě dlouhého textu', 'Zrcadlo strany'],
  ['Zrcadlo strany', 'Korektura prvního čtení'],
] as const

export const PROOF_INTRO =
  'Knihu tu nemáme, ale máme dvě strany k opravě. Najděte v nich chyby sazby, kliknutím je označte a nakonec stiskněte Odeslat. Kolik jich je, neprozradíme, korektorovi to také nikdo neřekne.'

export const PROOF_VERDICTS = [
  [1, 'Sazeč vám zítra nezvedne telefon.'],
  [0.75, 'Tisk by prošel. Redakce by se potila jen mírně.'],
  [0.5, 'Zbytek přežije do tisku.'],
  [0.01, 'Zbytek si čtenáři najdou sami. Rádi.'],
] as const

export const PROOF_FALLBACK_VERDICT = 'Čtenáři to také nepoznají.'
