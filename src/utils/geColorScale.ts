import { colord, extend, type Colord } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'
import mixPlugin from 'colord/plugins/mix'

extend([mixPlugin, a11yPlugin])

type colorsSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const MIN_TEXT_CONTRAST = 4.6
const DARKEN_STEP = 0.02
const MAX_DARKEN_STEPS = 60

const toReadable = (color: Colord, step = 0): Colord =>
  color.contrast() >= MIN_TEXT_CONTRAST || step >= MAX_DARKEN_STEPS
    ? color
    : toReadable(color.mix('#000', DARKEN_STEP), step + 1)

export const getColorScale = (
  baseColor: string,
  prefix: string,
): Record<`${string}${colorsSteps[number]}`, string> => {
  const base = toReadable(colord(baseColor))

  const tints = base.tints(6).toReversed().slice(1)
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
