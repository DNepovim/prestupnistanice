export const getFirstLetterIndex = (str: string): number => {
  const match = /\p{L}/u.exec(str)
  return match ? match.index : -1
}
