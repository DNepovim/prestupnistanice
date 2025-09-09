import type { Collection } from "tinacms";

export const AuthorsCollection: Collection = {
  name: "authors",
  label: "Autoři",
  path: "src/content/authors",
  ui: {
    filename: {
      readonly: true,
      slugify: ({
        firstname,
        surname,
      }: {
        firstname?: string;
        surname?: string;
      }) =>
        firstname && surname
          ? `${firstname}-${surname}`.toLowerCase().replace(/ /g, "-")
          : "",
    },
  },
  fields: [
    {
      type: "string",
      name: "firstname",
      label: "Jméno",
      required: true,
    },
    {
      type: "string",
      name: "surname",
      label: "Příjmení",
      required: true,
      isTitle: true,
    },
    {
      type: "datetime",
      name: "birthDate",
      label: "Datum narození",
    },
    {
      type: "datetime",
      name: "deathDate",
      label: "Datum úmrtí",
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
