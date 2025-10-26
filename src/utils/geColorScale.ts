import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'

extend([mixPlugin])

export const COLORS_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

export const getColorScale = (
  baseColor: string,
  prefix: string,
): Record<`${string}${(typeof COLORS_STEPS)[number]}`, string> => {
  const base = colord(baseColor)

  const tints = base.tints(6).reverse().slice(1)
  const shades = base.shades(6)

  return {
    ...[50, 100, 200, 300, 400].reduce<Record<number, string>>(
      (acc, step, i) => ({
        ...acc,
        [`${prefix}-${String(step)}`]: tints[i]?.toRgbString(),
      }),
      {},
    ),
    [`${prefix}-500`]: base.toRgbString(),
    ...[600, 700, 800, 900, 950].reduce<Record<number, string>>(
      (acc, step, i) => ({
        ...acc,
        [`${prefix}-${String(step)}`]: shades[i]?.toRgbString(),
      }),
      {},
    ),
  }
}
