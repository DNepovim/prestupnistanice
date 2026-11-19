export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
