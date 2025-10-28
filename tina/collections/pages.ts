import slugify from '@sindresorhus/slugify'
import type { Collection } from 'tinacms'

import type { Pages } from '../__generated__/types'
import { MarkdownInput } from '../components/Markdown'

export const PagesCollection: Collection = {
  name: 'pages',
  label: 'Stránky',
  path: 'src/content/pages',
  ui: {
    filename: {
      readonly: true,
      slugify: (v?: { title?: string }) =>
        (v?.title ?? '').toLowerCase().replace(/ /g, '-'),
    },
    // @ts-expect-error wrongly typed tina cms
    beforeSubmit: ({ values }: { values: Pages }) => ({
      ...values,
      slug: slugify(values.title),
    }),
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Název',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'content',
      label: 'Obsah',
      isBody: true,
      ui: {
        component: MarkdownInput,
      },
    },
  ],
}
