import type { Collection } from "tinacms";

export const BooksCollection: Collection = {
  name: "books",
  label: "Knihy",
  path: "src/content/books",
  ui: {
    filename: {
      readonly: true,
      slugify: (v?: { title?: string }) =>
        (v?.title ?? "").toLowerCase().replace(/ /g, "-"),
    },
  },
  fields: [
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
          ],
        },
      ],
    },
    { type: "image", name: "cover", label: "Obálka" },
    {
      type: "rich-text",
      name: "description",
      label: "Popis",
      isBody: true,
    },
  ],
};
