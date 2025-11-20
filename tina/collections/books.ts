import slugify from '@sindresorhus/slugify'
import type { Collection } from 'tinacms'

import type { Books } from '../__generated__/types'
import { getSlugFromPath } from '../../src/utils/getSlugFromPath'
import { MarkdownInput } from '../components/Markdown'

export const BooksCollection: Collection = {
  name: 'books',
  label: 'Knihy',
  path: 'src/content/books',
  ui: {
    filename: {
      readonly: true,
      slugify: (v?: { title?: string }) => (v?.title ? slugify(v.title) : ''),
    },
    // @ts-expect-error wrongly typed tina cms
    beforeSubmit: ({ values }: { values: Books }) => ({
      ...values,
      slug: slugify(values.title),
      authors: values.authors?.map((a) => ({
        ...a,
        slug: getSlugFromPath(a.author),
      })),
    }),
  },
  fields: [
    { type: 'string', name: 'slug', ui: { component: 'hidden' } },
    {
      type: 'string',
      name: 'title',
      label: 'Název',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'originlName',
      label: 'Původní název',
    },
    {
      type: 'number',
      name: 'date',
      label: 'Rok vydání',
      required: true,
    },
    {
      type: 'number',
      name: 'pagesCount',
      label: 'Počet stran',
    },
    {
      type: 'string',
      name: 'isbn',
      label: 'ISBN',
    },
    {
      name: 'authors',
      label: 'Autoři',
      type: 'object',
      ui: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        itemProps: (item) => ({ label: `${item.role} - ${item.author}` }),
      },
      list: true,
      fields: [
        {
          name: 'author',
          label: 'Autor',
          type: 'reference',
          collections: ['authors'],
          required: true,
        },
        { type: 'string', name: 'slug', ui: { component: 'hidden' }, required: true },
        {
          name: 'isMain',
          label: 'Hlavní',
          type: 'boolean',
        },
        {
          name: 'role',
          label: 'Role',
          type: 'string',
          list: true,
          required: true,
          options: [
            { label: 'Autor', value: 'author' },
            { label: 'Překladatel', value: 'translate' },
            { label: 'Redaktor', value: 'editor' },
            { label: 'Odpovědný redaktor', value: 'supereditor' },
            { label: 'Ilustrace', value: 'illustration' },
            { label: 'Obálka', value: 'cover' },
            { label: 'Sazba', value: 'typesetting' },
            { label: 'Recenzent', value: 'reviewer' },
            { label: 'Korektor', value: 'corrector' },
            { label: 'Konzultant', value: 'consultation' },
          ],
        },
        { name: 'col', label: 'Kolektiv', type: 'string' },
      ],
    },
    { type: 'image', name: 'cover', label: 'Obálka' },
    {
      type: 'string',
      name: 'category',
      label: 'Kategorie',
      options: [
        { label: 'Pro děti', value: 'forKids' },
        { label: 'Filosofie', value: 'philosophy' },
        { label: 'Román', value: 'novel' },
        { label: 'Poesie', value: 'poetry' },
      ],
      required: true,
    },
    {
      type: 'string',
      name: 'color',
      label: 'Barva popředí',
    },
    {
      type: 'string',
      name: 'bgColor',
      label: 'Barva pozadí',
    },
    { type: 'string', name: 'claim', label: 'Úvod' },
    {
      type: 'string',
      name: 'description',
      label: 'Popis',
      isBody: true,
      ui: {
        component: MarkdownInput,
      },
    },
  ],
}
