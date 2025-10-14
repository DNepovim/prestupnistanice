export const isLinkExternal = (url: string): boolean => {
  try {
    const link = new URL(url, window.location.origin)
    return link.origin !== window.location.origin
  } catch {
    // Neplatná URL → bereme jako interní
    return false
  }
}
