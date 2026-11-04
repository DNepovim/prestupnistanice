import slugify from '@sindresorhus/slugify'
import type { Collection } from 'tinacms'

import { MarkdownInput } from '../components/Markdown'

export const EventsCollection: Collection = {
  name: 'events',
  label: 'Akce',
  path: 'src/content/events',
  ui: {
    filename: {
      readonly: true,
      slugify: (v?: { title?: string }) => slugify(v?.title ?? ''),
    },
    // @ts-expect-error wrongly typed tina cms
    beforeSubmit: ({ values }: { values: { title?: string } }) => ({
      ...values,
      slug: slugify(values.title ?? ''),
    }),
  },
  fields: [
    { type: 'string', name: 'slug', ui: { component: 'hidden' } },
    {
      type: 'string',
      name: 'title',
      label: 'Název akce',
      isTitle: true,
      required: true,
    },
    {
      type: 'datetime',
      name: 'date',
      label: 'Datum',
      required: true,
    },
    {
      type: 'string',
      name: 'time',
      label: 'Čas',
    },
    {
      type: 'string',
      name: 'place',
      label: 'Místo',
      required: true,
    },
    {
      type: 'image',
      name: 'images',
      label: 'Fotky',
      list: true,
    },
    {
      type: 'string',
      name: 'description',
      label: 'Úvod',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'content',
      label: 'Obsah',
      isBody: true,
      ui: {
        // @ts-expect-error wrongly typed tina cms
        component: MarkdownInput,
      },
    },
  ],
}
