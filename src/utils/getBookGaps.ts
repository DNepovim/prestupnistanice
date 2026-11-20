import type { ImageMetadata } from 'astro'
import type { CollectionEntry } from 'astro:content'

import { BOOK_IMAGE_SPECS, getCoverTopSpec, getSizeCheck } from '@/utils/imageSpecs'
import { pluralize } from '@/utils/pluralize'

export type GapGroup = 'images' | 'metadata'

export type Gap = {
  key: string
  label: string
  group: GapGroup
  isPresent: boolean
  isApplicable: boolean
  detail?: string
  isTooSmall?: boolean
  hint?: string
}

type BookEntry = CollectionEntry<'book'>

const countDetail = (count: number, tooSmallCount: number) => {
  if (count === 0) {
    return undefined
  }
  return tooSmallCount > 0
    ? `${String(count)} (${pluralize(tooSmallCount, ['malá', 'malé', 'malých'])})`
    : String(count)
}

const singleDetail = (image: ImageMetadata | undefined, tooSmallCount: number) =>
  image && tooSmallCount > 0
    ? `${String(image.width)}×${String(image.height)}`
    : undefined

export const getBookGaps = (entry: BookEntry, galleryImages: ImageMetadata[]): Gap[] => {
  const { data, body } = entry
  const isReleased = data.isUpcoming !== true
  const hasSeparateThumb = data.coverImage ? data.cover.src !== data.coverImage.src : true
  const samplePages = data.samplePages ?? []
  const coverCheck = getSizeCheck(
    BOOK_IMAGE_SPECS.coverImage,
    data.coverImage ? [data.coverImage] : [],
  )
  const thumbCheck = getSizeCheck(
    BOOK_IMAGE_SPECS.thumb,
    hasSeparateThumb ? [data.cover] : [],
  )
  const topCheck = getSizeCheck(
    getCoverTopSpec(data.isPromoted === true),
    data.coverTop ? [data.coverTop] : [],
  )
  const sampleCheck = getSizeCheck(BOOK_IMAGE_SPECS.samplePage, samplePages)
  const galleryCheck = getSizeCheck(BOOK_IMAGE_SPECS.gallery, galleryImages)

  return [
    {
      key: 'coverImage',
      label: 'Obálka',
      group: 'images',
      isPresent: data.coverImage !== undefined,
      isApplicable: true,
      detail: singleDetail(data.coverImage, coverCheck.tooSmallCount),
      isTooSmall: coverCheck.tooSmallCount > 0,
      hint: coverCheck.hint,
    },
    {
      key: 'thumb',
      label: 'Náhled',
      group: 'images',
      isPresent: hasSeparateThumb,
      isApplicable: data.coverImage === undefined || data.coverTop !== undefined,
      detail: singleDetail(data.cover, thumbCheck.tooSmallCount),
      isTooSmall: thumbCheck.tooSmallCount > 0,
      hint: thumbCheck.hint,
    },
    {
      key: 'coverTop',
      label: 'Široký banner',
      group: 'images',
      isPresent: data.coverTop !== undefined,
      isApplicable: true,
      detail: singleDetail(data.coverTop, topCheck.tooSmallCount),
      isTooSmall: topCheck.tooSmallCount > 0,
      hint: topCheck.hint,
    },
    {
      key: 'samplePages',
      label: 'Ukázka',
      group: 'images',
      isPresent: samplePages.length > 0,
      isApplicable: true,
      detail: countDetail(samplePages.length, sampleCheck.tooSmallCount),
      isTooSmall: sampleCheck.tooSmallCount > 0,
      hint: sampleCheck.hint,
    },
    {
      key: 'gallery',
      label: 'Galerie',
      group: 'images',
      isPresent: galleryImages.length > 0,
      isApplicable: isReleased,
      detail: countDetail(galleryImages.length, galleryCheck.tooSmallCount),
      isTooSmall: galleryCheck.tooSmallCount > 0,
      hint: galleryCheck.hint,
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
