import type { CollectionEntry } from "astro:content";

export const getAuthorsSecondName = (a: CollectionEntry<"author">["data"]) => `${a.firstnameSecond ?? a.firstname} ${a.surnameSecond ?? a.surname}`
