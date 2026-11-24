export const PROOF_SOURCE: readonly (readonly string[])[] = [
  [
    'h|I. Zrcadlo strany',
    'g|',
    'f|Sazeč začíná tím, že si vyměří zrcadlo strany. Je to plocha,',
    'm|kterou smí zaplnit text. Kolem ní zůstává bílé pole, kterému se',
    'm|říká okraje. Čtenář je obvykle nevidí, ale poznal by hned, kdyby',
    'm|chyběly. Okraje, mezery i řádky tvoří jeden celek, a dobrá ⟦d1|saz-⟧',
    'm|⟦d1|ba⟧ se pozná podle toho, že se o ní vůbec nemluví a text plyne od',
    'm|řádku k řádku bez zákeřných překážek a zpravidla nikdo proti',
    'e|⟦d2|ní nic nenamítá.⟧',
    'f|Korektor čte jinak než obyčejný čtenář. Nejde mu o děj, ale',
    'm|právě o písmena, čárky a mezery mezi slovy. Čte pomalu, někdy',
    'm|dokonce ⟦e16|pozp*á*tku,⟧ aby se nenechal strhnout dějem. Každý text',
    'm|pročítá nejméně ⟦e15|dvakrát ,⟧ a pokaždé hledá ⟦e14|něco  jiného,⟧ a proto',
    'e|čte znovu a znovu.',
    'f|Česká sazba zná pravidla, která platí odnepaměti. Řádek se',
    'm|například nemá končit jednopísmennou předložkou, protože by',
    'm|se četla zvlášť, a navíc vypadá nepěkně. Přesto se stane, ⟦e4|že se k⟧',
    'm|slovu nepřipojí a zůstane na konci řádku. Čtenář si toho obvykle',
    'e|nevšimne, ale korektor ano. To je celý rozdíl mezi ⟦d4|nimi…⟧',
    'f|Totéž platí o dělení slov. Sazeč dělí podle slabik a nikdy tak,',
    'm|aby na řádku zůstalo jediné písmeno. Poslední slovo odstavce se',
    'm|také nemá dělit. Tady se to nepovedlo, takže se tento odstavec',
    'm|zakončil slovem, které samo zůstalo na posledním řádku ⟦e3|rozdě-⟧',
    'e|⟦e3|leným.⟧',
    'f|Zrcadlo ovšem není jen obdélník na papíře. Určuje rytmus',
    'm|knihy a pomáhá čtenáři, aby se v ní neztratil, protože se podle',
  ],
  [
    'e|⟦e1|něj řídí všechny další strany.⟧',
    'u|⟦e17|Mezery mezi slovy mají být stejně široké, jinak se text rozpadá⟧',
    'm|na světlé a tmavé pruhy. Nejhorší to bývá vždy v úzkém sloupci.',
    'm|⟦e8|Tehdy se všechny mezery rozevřou.⟧',
    'm|Takový čtenář nečte slova, ale hledá cestu od jednoho slova ke',
    'e|druhému mezi ⟦e9|mezerami - a⟧ to je únavné.',
    'f|⟦e7|Nejhůř působí žebříček, tedy několik řádků pod sebou, které⟧',
    'm|⟦e7|všechny končí přerušeným slovem. Oko pak poskakuje po okra-⟧',
    'm|⟦e7|ji a hledá, kde které další slovo pokračuje a kde se znovu zlome-⟧',
    'm|⟦e7|né slovo vrací zpět do řady. Taková sazba čtenáře rychle unavu-⟧',
    'm|⟦e7|je a odrazuje od čtení. Sazeč proto dělení důsledně hlídá a kon-⟧',
    'm|troluje, aby se žádné dělení neopakovalo, a nenechá ho narůst ⟦e5|v⟧',
    'e|řadě nad tři řádky.',
    'f|Pozor je třeba dávat i na čísla a značky. Náklad první edice',
    'm|činil podle zápisu, který se dochoval v archivu nakladatelství, ⟦e12|2⟧',
    'm|⟦e12|000⟧ výtisků, tisk příloh stál ⟦d6|10~000~Kč.⟧ Zkratky se píší s tečkou',
    'm|a od čísla se nesmějí oddělit, jak je vidět ve vydaném sborníku ⟦e13|č.⟧',
    'e|⟦e13|5⟧ z minulého roku, na stranách ⟦d7|40–46.⟧',
    'f|Uvozovky se v češtině píší dole a nahoře, jak je vidět u slova',
    'm|⟦d3|„sazba“.⟧ Rovné ⟦e10|"takto"⟧ jsou prý z psacího stroje a do knihy se',
    'm|nehodí. Podobně výpustka je jen jeden znak, a ne tři ⟦e11|tečky...⟧',
    'm|Horší je ovšem oddělit jediné písmeno slova od zbytku, třeba ⟦e6|o-⟧',
    'm|⟦e6|kno,⟧ které se pak ztratí na dalším řádku a čtenář pak hledá, kam',
    'm|se poděla druhá část. Když je vše v pořádku, čtenář se může ⟦d5|po-⟧',
    'e|⟦d5|hodlně⟧ opřít a nevšímat si ničeho.',
    'f|⟦e2|Korektor to ovšem vidí jinak. Chyba se vždy někde ukryje, ať⟧',
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

export const PROOF_VERDICTS = [
  [1, 'Sazeč vás může pustit k pultu. Žádná chyba mu neunikla.'],
  [0.75, 'Do tisku by to šlo. Redakce by se potila jen mírně.'],
  [
    0.5,
    'Polovina chyb by tisk přežila. Čtenáři by ji nenašli, ale dozvěděli by se o ní.',
  ],
  [0.01, 'Zbytek si čtenáři najdou sami. A rádi se o tom zmíní v recenzích.'],
] as const

export const PROOF_FALLBACK_VERDICT =
  'Čtenáři by to také nepoznali. Zkuste to znovu, strany počkají.'
