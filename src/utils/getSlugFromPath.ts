
export const getSlugFromPath = (path: string): string => {
  const parts = path.split(/[/\\]/)
  const filename = parts[parts.length - 1]
  if (!filename) {
    return ''
  }
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex === -1 ? filename : filename.slice(0, dotIndex)
}

