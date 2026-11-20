export const WAVE_STEP_CLASS =
  'cursor-pointer transition-transform duration-300 ease-out hover:scale-y-[1.7] [&:hover+*]:scale-y-[1.35] [&:has(+*:hover)]:scale-y-[1.35] [&:hover+*+*]:scale-y-[1.12] [&:has(+*+*:hover)]:scale-y-[1.12] motion-reduce:transition-none'

export const WAVE_ORIGIN_CLASSES = {
  up: 'origin-bottom',
  down: 'origin-top',
} as const
