import slugify from "@sindresorhus/slugify";
import type { Collection } from "tinacms";

export const BooksCollection: Collection = {
  name: "books",
  label: "Knihy",
  path: "src/content/books",
  ui: {
    filename: {
      readonly: true,
      slugify: (v?: { title?: string }) => (v?.title ? slugify(v.title) : ""),
    },
    beforeSubmit: ({ values }) => ({
      ...values,
      slug: slugify(values.title),
    }),
  },
  fields: [
    { type: "string", name: "slug", ui: { component: "hidden" } },
    {
      type: "string",
      name: "title",
      label: "Název",
      isTitle: true,
      required: true,
    },
    {
      type: "number",
      name: "date",
      label: "Rok vydání",
    },
    {
      type: "number",
      name: "pagesCount",
      label: "Počet stran",
    },
    {
      type: "string",
      name: "isbn",
      label: "ISBN",
    },
    {
      name: "authors",
      label: "Autoři",
      type: "object",
      list: true,
      fields: [
        {
          name: "author",
          label: "Autor",
          type: "reference",
          collections: ["authors"],
        },
        {
          name: "role",
          label: "Role",
          type: "string",
          options: [
            { label: "Autor", value: "author" },
            { label: "Překladatel", value: "translate" },
            { label: "Redaktor", value: "editor" },
            { label: "Ilustrace", value: "illustration" },
            { label: "Obálka", value: "cover" },
            { label: "Sazba", value: "typesetting" },
            { label: "Recenzent", value: "reviewer" },
          ],
        },
      ],
    },
    { type: "image", name: "cover", label: "Obálka" },
    {
      type: "string",
      name: "category",
      label: "Kategorie",
      options: [
        { label: "Pro děti", value: "forKids" },
        { label: "Filosofie", value: "philosophy" },
        { label: "Román", value: "novel" },
        { label: "Poesie", value: "poetry" },
      ],
    },
    {
      type: "string",
      name: "color",
      label: "Barva",
    },
    {
      type: "rich-text",
      name: "description",
      label: "Popis",
      isBody: true,
    },
  ],
};
