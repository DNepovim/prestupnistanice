type ImageSize = {
  width: number
  height: number
}

type ImageUsage = {
  place: string
  size: string
}

type ImageSpec = {
  label: string
  cmsField: string
  minWidth: number
  minHeight?: number
  ratio: string
  usages: ImageUsage[]
}

export const AUTHOR_IMAGE_SPEC = {
  label: 'Fotka autora',
  cmsField: 'Fotka',
  minWidth: 560,
  ratio: 'libovolný, nejlépe na výšku; tvář v horní polovině',
  usages: [
    { place: 'Detail autora – postranní panel (15,5 rem)', size: '560 px na šířku' },
    { place: 'Náhled odkazu v textu', size: '336 px na šířku' },
    { place: 'Vyhledávání – kruhový výřez shora', size: '160 × 160 px' },
    {
      place: 'Portrét v tvůrcích knihy a na stránce o nakladatelství',
      size: '96 × 96 px',
    },
    { place: 'Malý kruh v seznamech autorů', size: '40 × 40 px' },
  ],
} as const satisfies ImageSpec

export const BOOK_IMAGE_SPECS = {
  coverImage: {
    label: 'Obálka',
    cmsField: 'Obálka',
    minWidth: 560,
    ratio: 'poměr stran obálky, celá obálka bez ořezu',
    usages: [
      { place: 'Detail knihy – panel s obálkou (16 rem)', size: '560 px na šířku' },
      { place: 'Detail knihy – schéma rozměrů knihy', size: '240 px na šířku' },
      {
        place: 'Náhled všude jinde, pokud chybí samostatná fotka knihy',
        size: '560 px na šířku',
      },
    ],
  },
  thumb: {
    label: 'Fotka knihy (náhled)',
    cmsField: 'Fotka knihy',
    minWidth: 520,
    ratio: 'na výšku, nejlépe stejný poměr jako obálka',
    usages: [
      { place: 'Přehled knih – mřížka', size: '520 px na šířku' },
      { place: 'Úryvek knihy na úvodní stránce', size: '480 px na šířku' },
      { place: 'Přehled knih – náhled při najetí', size: '336 px na šířku' },
      { place: 'Náhled odkazu v textu', size: '336 px na šířku' },
      { place: 'Karusel na mobilu – čtvercový výřez', size: '300 × 300 px' },
      { place: 'Vyhledávání', size: '240 px na šířku' },
      { place: 'Karta knihy v seznamech', size: '158 px na šířku' },
      { place: 'Přepínač karuselu', size: '40 × 40 px' },
    ],
  },
  coverTop: {
    label: 'Široký banner',
    cmsField: 'Fotografie knihy (široká)',
    minWidth: 2400,
    minHeight: 960,
    ratio: '5 : 2, důležité věci uprostřed (okraje se ořezávají)',
    usages: [
      { place: 'Detail knihy – hlavní banner (62 rem)', size: '2400 × 960 px' },
      {
        place: 'Detail knihy – sousední knihy po stranách banneru',
        size: '1200 px na šířku',
      },
    ],
  },
  coverTopPromoted: {
    label: 'Široký banner (propagovaná kniha)',
    cmsField: 'Fotografie knihy (široká) + Propagovaná',
    minWidth: 3550,
    minHeight: 1420,
    ratio: '5 : 2, uprostřed se ořezává na skoro čtverec 1338 × 1420 px',
    usages: [
      { place: 'Karusel na úvodní stránce – výřez z banneru', size: '1338 × 1420 px' },
      { place: 'Detail knihy – hlavní banner', size: '2400 × 960 px' },
    ],
  },
  samplePage: {
    label: 'Strana ukázky',
    cmsField: 'Ukázka z knihy (strany)',
    minWidth: 1100,
    ratio: 'stejný poměr jako strana knihy, všechny strany stejně velké',
    usages: [{ place: 'Listovací ukázka na detailu knihy', size: '1100 px na šířku' }],
  },
  gallery: {
    label: 'Fotka v galerii',
    cmsField: 'soubory ve složce gallery u knihy',
    minWidth: 2000,
    minHeight: 680,
    ratio: 'libovolný',
    usages: [
      { place: 'Lightbox – plná velikost', size: '2000 px na šířku' },
      { place: 'Náhledy v galerii', size: '680 px na výšku' },
    ],
  },
} as const satisfies Record<string, ImageSpec>

export const getCoverTopSpec = (isPromoted: boolean) =>
  isPromoted ? BOOK_IMAGE_SPECS.coverTopPromoted : BOOK_IMAGE_SPECS.coverTop

const isTooSmall = (spec: ImageSpec, image: ImageSize) =>
  image.width < spec.minWidth || image.height < (spec.minHeight ?? 0)

const formatSize = (image: ImageSize) => `${String(image.width)}×${String(image.height)}`

export const formatMinSize = (spec: ImageSpec) =>
  spec.minHeight === undefined
    ? `${String(spec.minWidth)} px na šířku`
    : `${String(spec.minWidth)} × ${String(spec.minHeight)} px`

export const getSizeCheck = (spec: ImageSpec, images: readonly ImageSize[]) => {
  const tooSmall = images.filter((image) => isTooSmall(spec, image))
  const first = tooSmall[0]
  return {
    tooSmallCount: tooSmall.length,
    hint:
      first === undefined
        ? undefined
        : `${formatSize(first)} px, potřeba alespoň ${formatMinSize(spec)}`,
  }
}
