import type { CollectionEntry } from 'astro:content'

import type { Gap } from '@/utils/getBookGaps'

type AuthorEntry = CollectionEntry<'author'>

export const getAuthorGaps = (entry: AuthorEntry): Gap[] => {
  const { data, body } = entry

  return [
    {
      key: 'image',
      label: 'Fotka',
      group: 'images',
      isPresent: data.image !== undefined,
      isApplicable: true,
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
