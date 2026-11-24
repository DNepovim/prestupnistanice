import type { OrderStep } from '@/stores/order'

export const STEP_VARS = {
  1: '[--step:var(--color-ink-blue)] [--step-ink:color-mix(in_srgb,var(--color-ink-blue),black_20%)]',
  2: '[--step:var(--color-ink-magenta)] [--step-ink:color-mix(in_srgb,var(--color-ink-magenta),black_20%)]',
  3: '[--step:var(--color-ink-green)] [--step-ink:color-mix(in_srgb,var(--color-ink-green),black_20%)]',
} as const satisfies Record<OrderStep, string>
