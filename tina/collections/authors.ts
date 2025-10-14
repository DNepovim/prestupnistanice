import slugify from '@sindresorhus/slugify'
import type { Collection } from 'tinacms'

import { MarkdownInput } from '../components/Markdown'

export const AuthorsCollection: Collection = {
  name: 'authors',
  label: 'Autoři',
  path: 'src/content/authors',
  ui: {
    filename: {
      readonly: true,
      slugify: ({ firstname, surname }: { firstname?: string; surname?: string }) =>
        firstname && surname ? slugify(`${firstname} ${surname}`) : '',
    },
    // @ts-expect-error wrongly typed tina cms
    beforeSubmit: ({ values }) => {
      return {
        ...values,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        slug: slugify(`${values.firstname} ${values.surname}`),
      }
    },
  },
  fields: [
    { type: 'string', name: 'slug', ui: { component: 'hidden' } },
    {
      type: 'string',
      name: 'firstname',
      label: 'Jméno',
      required: true,
    },
    {
      type: 'string',
      name: 'firstnameSecond',
      label: 'Jméno (2. pád)',
    },
    {
      type: 'string',
      name: 'surname',
      label: 'Příjmení',
      required: true,
      isTitle: true,
    },
    {
      type: 'string',
      name: 'surnameSecond',
      label: 'Příjmení (2. pád)',
    },
    {
      type: 'datetime',
      name: 'birthDate',
      label: 'Datum narození',
    },
    {
      type: 'datetime',
      name: 'deathDate',
      label: 'Datum úmrtí',
    },
    {
      type: 'string',
      name: 'gender',
      label: 'Pohlaví',
      options: [
        {
          label: 'Žena',
          value: 'female',
        },
        {
          label: 'Muž',
          value: 'male',
        },
      ],
    },
    { type: 'image', name: 'image', label: 'Fotka' },
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
