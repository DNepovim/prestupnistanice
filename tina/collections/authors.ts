import slugify from '@sindresorhus/slugify'
import type { Collection } from 'tinacms'

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
    beforeSubmit: ({ values }) => {
      return {
        ...values,
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
      name: 'surname',
      label: 'Příjmení',
      required: true,
      isTitle: true,
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

    {
      type: 'rich-text',
      name: 'description',
      label: 'Popis',
      isBody: true,
    },
  ],
}
