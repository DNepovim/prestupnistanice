export const joinWords = (texts: string[]) =>
  texts.map(
    (t, i) =>
      `${t}${i === texts.length - 2 ? ' a ' : i === texts.length - 1 ? '' : ', '}`,
  )
