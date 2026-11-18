import type { Collection } from 'tinacms'

export const ReviewsCollection: Collection = {
  name: 'reviews',
  label: 'Recenze',
  path: 'src/content/reviews',
  fields: [
    {
      type: 'string',
      name: 'book',
      label: 'Kniha (slug)',
      description: 'Například tati nebo nevychovne-eseje-o-vychove',
      required: true,
    },
    {
      type: 'string',
      name: 'source',
      label: 'Zdroj',
      required: true,
      options: [
        { label: 'Kosmas', value: 'kosmas' },
        { label: 'Databáze knih', value: 'databazeknih' },
        { label: 'Tisk', value: 'press' },
        { label: 'Web', value: 'web' },
      ],
    },
    { type: 'string', name: 'url', label: 'Odkaz na recenzi' },
    {
      type: 'string',
      name: 'reviewer',
      label: 'Recenzent',
      required: true,
      isTitle: true,
    },
    { type: 'datetime', name: 'date', label: 'Datum' },
    { type: 'number', name: 'rating', label: 'Hodnocení (1–5)' },
    {
      type: 'string',
      name: 'permission',
      label: 'Na jakém základě text zveřejňujeme',
      required: true,
      options: [
        { label: 'Souhlas autora', value: 'consent' },
        { label: 'Citace', value: 'quote' },
        { label: 'Vlastní text', value: 'own' },
      ],
    },
    {
      type: 'string',
      name: 'body',
      label: 'Text',
      isBody: true,
      ui: { component: 'textarea' },
    },
  ],
}
