export const uppercaseFirstLetter = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const uppercaseEveryFirstLetters = (s: string) =>
  s
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
