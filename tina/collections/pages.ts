import type { Collection } from 'tinacms'

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
      type: 'rich-text',
      name: 'content',
      label: 'Obsah',
      isBody: true,
    },
  ],
}
