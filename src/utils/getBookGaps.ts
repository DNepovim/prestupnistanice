import type { CollectionEntry } from 'astro:content'

type GapGroup = 'images' | 'metadata'

type Gap = {
  key: string
  label: string
  group: GapGroup
  isPresent: boolean
  isApplicable: boolean
  detail?: string
}

type BookEntry = CollectionEntry<'book'>

const countDetail = (count: number) => (count > 0 ? String(count) : undefined)

export const getBookGaps = (entry: BookEntry, galleryCount: number): Gap[] => {
  const { data, body } = entry
  const isReleased = data.isUpcoming !== true
  const hasSeparateThumb = data.coverImage ? data.cover.src !== data.coverImage.src : true
  const samplePagesCount = data.samplePages?.length ?? 0

  return [
    {
      key: 'coverImage',
      label: 'Obálka',
      group: 'images',
      isPresent: data.coverImage !== undefined,
      isApplicable: true,
    },
    {
      key: 'thumb',
      label: 'Náhled',
      group: 'images',
      isPresent: hasSeparateThumb,
      isApplicable: data.coverImage === undefined || data.coverTop !== undefined,
    },
    {
      key: 'coverTop',
      label: 'Široký banner',
      group: 'images',
      isPresent: data.coverTop !== undefined,
      isApplicable: true,
    },
    {
      key: 'samplePages',
      label: 'Ukázka',
      group: 'images',
      isPresent: samplePagesCount > 0,
      isApplicable: true,
      detail: countDetail(samplePagesCount),
    },
    {
      key: 'gallery',
      label: 'Galerie',
      group: 'images',
      isPresent: galleryCount > 0,
      isApplicable: isReleased,
      detail: countDetail(galleryCount),
    },
    {
      key: 'body',
      label: 'Anotace',
      group: 'metadata',
      isPresent: Boolean(body?.trim()),
      isApplicable: true,
    },
    {
      key: 'claim',
      label: 'Claim',
      group: 'metadata',
      isPresent: Boolean(data.claim),
      isApplicable: true,
    },
    {
      key: 'colors',
      label: 'Barvy',
      group: 'metadata',
      isPresent: Boolean(data.color && data.bgColor),
      isApplicable: true,
    },
    {
      key: 'pagesCount',
      label: 'Stránky',
      group: 'metadata',
      isPresent: data.pagesCount !== undefined,
      isApplicable: true,
    },
    {
      key: 'size',
      label: 'Rozměry',
      group: 'metadata',
      isPresent: data.width !== undefined && data.height !== undefined,
      isApplicable: true,
    },
    {
      key: 'paper',
      label: 'Papír',
      group: 'metadata',
      isPresent: Boolean(data.paper),
      isApplicable: true,
    },
    {
      key: 'font',
      label: 'Písmo',
      group: 'metadata',
      isPresent: Boolean(data.font),
      isApplicable: true,
    },
    {
      key: 'isbn',
      label: 'ISBN',
      group: 'metadata',
      isPresent: Boolean(data.isbn),
      isApplicable: true,
    },
    {
      key: 'price',
      label: 'Cena',
      group: 'metadata',
      isPresent: data.price !== undefined,
      isApplicable: isReleased,
    },
    {
      key: 'kosmasUrl',
      label: 'Kosmas',
      group: 'metadata',
      isPresent: Boolean(data.kosmasUrl),
      isApplicable: isReleased,
    },
  ]
}
