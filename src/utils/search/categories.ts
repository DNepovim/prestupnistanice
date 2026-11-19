import { CATEGORIES } from '@/routes'
import { uppercaseFirstLetter } from '@/utils/uppercaseFirstLetter'

import type { SearchCategoryKey } from './types'

export const SEARCH_CATEGORY_KEYS = [
  'forKids',
  'philosophy',
  'novel',
  'poetry',
] as const satisfies readonly SearchCategoryKey[]

export const CATEGORY_ALIASES = {
  forKids: ['deti', 'detske', 'detem', 'pohadky'],
  philosophy: ['filosofie', 'filozofie', 'filosofy', 'filosof', 'esej', 'eseje'],
  novel: ['romantiky', 'romantik', 'roman', 'romany', 'proza', 'beletrie'],
  poetry: ['poety', 'poet', 'poezie', 'basne', 'basen'],
} as const satisfies Record<SearchCategoryKey, readonly string[]>

export const getCategoryLabel = (key: SearchCategoryKey) =>
  uppercaseFirstLetter(CATEGORIES[key].name)

export const getCategoryTabLabel = (key: SearchCategoryKey) => CATEGORIES[key].name
