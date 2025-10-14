export const html = (strings: TemplateStringsArray, ...values: unknown[]): string => {
  let result = ''

  strings.forEach((str, i) => {
    result += str
    if (i < values.length) {
      result += String(values[i])
    }
  })

  return result
}
