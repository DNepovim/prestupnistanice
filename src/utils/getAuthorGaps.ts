import type { CollectionEntry } from 'astro:content'

import type { Gap } from '@/utils/getBookGaps'
import { AUTHOR_IMAGE_SPEC, getSizeCheck } from '@/utils/imageSpecs'

type AuthorEntry = CollectionEntry<'author'>

export const getAuthorGaps = (entry: AuthorEntry): Gap[] => {
  const { data, body } = entry
  const imageCheck = getSizeCheck(AUTHOR_IMAGE_SPEC, data.image ? [data.image] : [])

  return [
    {
      key: 'image',
      label: 'Fotka',
      group: 'images',
      isPresent: data.image !== undefined,
      isApplicable: true,
      detail:
        data.image && imageCheck.tooSmallCount > 0
          ? `${String(data.image.width)}×${String(data.image.height)}`
          : undefined,
      isTooSmall: imageCheck.tooSmallCount > 0,
      hint: imageCheck.hint,
    },
    {
      key: 'body',
      label: 'Medailon',
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
      key: 'birthDate',
      label: 'Narození',
      group: 'metadata',
      isPresent: data.birthDate !== undefined,
      isApplicable: true,
    },
    {
      key: 'declension',
      label: 'Skloňování',
      group: 'metadata',
      isPresent: Boolean(data.firstnameSecond && data.surnameSecond),
      isApplicable: true,
    },
    {
      key: 'aboutRole',
      label: 'Role na webu',
      group: 'metadata',
      isPresent: Boolean(data.aboutRole),
      isApplicable: data.showOnAboutPage === true,
    },
  ]
}
