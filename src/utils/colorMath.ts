const LUMINANCE_THRESHOLD = 0.179

const toLinear = (channel: number) => {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const getRelativeLuminance = (channels: readonly number[]) => {
  const [r = 0, g = 0, b = 0] = channels.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const isDarkColor = (channels: readonly number[]) =>
  getRelativeLuminance(channels) <= LUMINANCE_THRESHOLD
