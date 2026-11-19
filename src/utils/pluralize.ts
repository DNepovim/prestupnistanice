export const pluralize = (
  count: number,
  [one, few, many]: readonly [string, string, string],
) => {
  if (count === 1) {
    return `${String(count)} ${one}`
  }
  return `${String(count)} ${count >= 2 && count <= 4 ? few : many}`
}
