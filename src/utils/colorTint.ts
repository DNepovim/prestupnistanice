import { isDarkColor } from '@/utils/colorMath'

const SCOPE_SELECTOR = '[data-tint-scope]'
const STEP_SELECTOR = '[data-color-step]'
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea'
const BOOK_COLOR_PROPERTY = '--color-brand-first-500'
const PAPER_CHANNELS = [252, 249, 242] as const
const WHITE_CHANNELS = [255, 255, 255] as const
const SCOPE_TINT_ALPHA_PROPERTY = '--scope-tint-alpha'
const TINT_ALPHA_PROPERTY = '--page-tint-alpha'
const FALLBACK_PAGE_TINT_ALPHA = 0.7
const PAGE_CONTENT_SELECTOR = 'section, header, footer, nav, aside, article'
const FOREGROUND_ON_LIGHT = { color: '#101828', bookHuePercent: 28 }
const FOREGROUND_ON_DARK = { color: '#ffffff', bookHuePercent: 12 }
const RIPPLE_NAME = 'tile-ripple'
const RIPPLE_DURATION_MS = 750
const RIPPLE_EASING = 'cubic-bezier(0.33, 0, 0.2, 1)'
const FEATHER_CORE = 0.3
const FEATHER_STOPS = [
  [0.3, 1],
  [0.4, 0.92],
  [0.5, 0.75],
  [0.6, 0.5],
  [0.7, 0.27],
  [0.8, 0.1],
  [0.9, 0.02],
  [1, 0],
] as const

type Point = { x: number; y: number }

const ripple: { active?: ViewTransition } = {}

const isPageScope = (scope: HTMLElement) => scope === document.documentElement

const getTintStyles = (
  background: string,
  foreground: string,
  isPage: boolean,
): Record<string, string> =>
  isPage
    ? {
        '--tint-bg': background,
        color: foreground,
        '--tint-fg': foreground,
        '--color-brand-second-200': foreground,
        '--color-brand-second-300': foreground,
      }
    : {
        '--tint-bg': background,
        color: foreground,
        '--color-brand-first-500': foreground,
        '--color-brand-first-700': foreground,
        '--color-black': foreground,
        '--color-gray-900': foreground,
        '--color-gray-800': foreground,
        '--color-gray-700': `color-mix(in srgb, ${foreground} 85%, transparent)`,
        '--color-gray-600': `color-mix(in srgb, ${foreground} 75%, transparent)`,
        '--color-gray-500': `color-mix(in srgb, ${foreground} 65%, transparent)`,
        '--color-gray-400': `color-mix(in srgb, ${foreground} 55%, transparent)`,
        '--color-gray-300': `color-mix(in srgb, ${foreground} 35%, transparent)`,
        '--color-gray-200': `color-mix(in srgb, ${foreground} 25%, transparent)`,
      }

const TINT_PROPERTIES = [
  ...Object.keys(getTintStyles('', '', false)),
  ...Object.keys(getTintStyles('', '', true)),
]

const parseChannels = (color: string) => {
  const scale = color.startsWith('color(') ? 255 : 1
  return (color.match(/-?\d*\.?\d+/g) ?? [])
    .slice(0, 3)
    .map((value) => Number(value) * scale)
}

const getForeground = (channels: readonly number[]) =>
  isDarkColor(channels) ? FOREGROUND_ON_DARK : FOREGROUND_ON_LIGHT

const getTintAlpha = (scope: HTMLElement, isPage: boolean) => {
  const percent = Number.parseFloat(
    getComputedStyle(isPage ? document.body : scope).getPropertyValue(
      isPage ? TINT_ALPHA_PROPERTY : SCOPE_TINT_ALPHA_PROPERTY,
    ),
  )
  return Number.isNaN(percent) ? FALLBACK_PAGE_TINT_ALPHA : percent / 100
}

const blendWithPaper = (
  scope: HTMLElement,
  channels: readonly number[],
  isPage: boolean,
) => {
  const alpha = getTintAlpha(scope, isPage)
  const paperChannels = isPage ? PAPER_CHANNELS : WHITE_CHANNELS
  return paperChannels.map(
    (paper, index) => paper + ((channels[index] ?? paper) - paper) * alpha,
  )
}

const clearSelectedSteps = (scope: HTMLElement) => {
  scope.querySelectorAll<HTMLElement>('[data-selected]').forEach((step) => {
    delete step.dataset.selected
  })
}

const clearTintProperties = (scope: HTMLElement) => {
  TINT_PROPERTIES.forEach((property) => {
    scope.style.removeProperty(property)
  })
}

const resetScope = (scope: HTMLElement) => {
  clearTintProperties(scope)
  delete scope.dataset.tintStep
  clearSelectedSteps(scope)
}

const getForegroundWithBookHue = (
  scope: HTMLElement,
  base: typeof FOREGROUND_ON_LIGHT | typeof FOREGROUND_ON_DARK,
) => {
  const bookColor = getComputedStyle(scope).getPropertyValue(BOOK_COLOR_PROPERTY).trim()
  return bookColor
    ? `color-mix(in srgb, ${bookColor} ${String(base.bookHuePercent)}%, ${base.color})`
    : base.color
}

const tintScope = (scope: HTMLElement, step: HTMLElement, stepIndex: number) => {
  const isPage = isPageScope(scope)
  clearTintProperties(scope)
  const background = getComputedStyle(step).backgroundColor
  const channels = parseChannels(background)
  const base = getForeground(blendWithPaper(scope, channels, isPage))
  const foreground = getForegroundWithBookHue(scope, base)
  Object.entries(getTintStyles(background, foreground, isPage)).forEach(
    ([property, value]) => {
      scope.style.setProperty(property, value)
    },
  )
  scope.dataset.tintStep = String(stepIndex)
  clearSelectedSteps(scope)
  step.dataset.selected = ''
}

const toggleTint = (scope: HTMLElement, step: HTMLElement, stepIndex: number) => {
  if (step.dataset.selected === undefined) {
    tintScope(scope, step, stepIndex)
    return
  }
  resetScope(scope)
}

const canAnimate = () =>
  typeof document.startViewTransition === 'function' &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches

const getRippleKeyframes = (scope: HTMLElement, origin: Point): Keyframe[] => {
  const { left, top, width, height } = isPageScope(scope)
    ? { left: 0, top: 0, width: innerWidth, height: innerHeight }
    : scope.getBoundingClientRect()
  const x = origin.x - left
  const y = origin.y - top
  const reach = Math.hypot(Math.max(x, width - x), Math.max(y, height - y))
  const diameter = (2 * reach) / FEATHER_CORE
  const stops = FEATHER_STOPS.map(
    ([stop, alpha]) => `rgba(0, 0, 0, ${String(alpha)}) ${String(stop * 100)}%`,
  ).join(', ')
  const maskImage = `radial-gradient(circle closest-side, ${stops})`
  return [
    {
      maskImage,
      maskRepeat: 'no-repeat',
      maskSize: '0px 0px',
      maskPosition: `${String(x)}px ${String(y)}px`,
    },
    {
      maskImage,
      maskRepeat: 'no-repeat',
      maskSize: `${String(diameter)}px ${String(diameter)}px`,
      maskPosition: `${String(x - diameter / 2)}px ${String(y - diameter / 2)}px`,
    },
  ]
}

const rippleThrough = async (scope: HTMLElement, origin: Point, update: () => void) => {
  if (!canAnimate()) {
    update()
    return
  }
  const keyframes = getRippleKeyframes(scope, origin)
  scope.dataset.rippling = ''
  if (!isPageScope(scope)) {
    scope.style.setProperty('view-transition-name', RIPPLE_NAME)
  }
  const transition = document.startViewTransition(update)
  ripple.active = transition
  await transition.ready
    .then(() => {
      document.documentElement.animate(keyframes, {
        duration: RIPPLE_DURATION_MS,
        easing: RIPPLE_EASING,
        pseudoElement: `::view-transition-new(${isPageScope(scope) ? 'root' : RIPPLE_NAME})`,
      })
    })
    .catch(() => undefined)
  await transition.finished.catch(() => undefined)
  if (ripple.active === transition) {
    ripple.active = undefined
  }
  delete scope.dataset.rippling
  if (!isPageScope(scope)) {
    scope.style.removeProperty('view-transition-name')
  }
}

const isTinted = (scope: HTMLElement) => scope.dataset.tintStep !== undefined

const handleClick = (target: Element, origin: Point) => {
  const step = target.closest<HTMLElement>(STEP_SELECTOR)
  const scope = target.closest<HTMLElement>(SCOPE_SELECTOR)
  if (!scope) {
    return
  }
  if (!step) {
    const isResettableArea = !isPageScope(scope) || !target.closest(PAGE_CONTENT_SELECTOR)
    if (isResettableArea && isTinted(scope) && !target.closest(INTERACTIVE_SELECTOR)) {
      rippleThrough(scope, origin, () => {
        resetScope(scope)
      }).catch(() => {
        resetScope(scope)
      })
    }
    return
  }
  const stepIndex = Array.from(step.parentElement?.children ?? []).indexOf(step)
  rippleThrough(scope, origin, () => {
    toggleTint(scope, step, stepIndex)
  }).catch(() => {
    toggleTint(scope, step, stepIndex)
  })
}

document.addEventListener('click', (event) => {
  const origin = { x: event.clientX, y: event.clientY }
  const running = ripple.active
  if (running) {
    running.skipTransition()
    running.finished
      .catch(() => undefined)
      .then(() => {
        const target = document.elementFromPoint(origin.x, origin.y)
        if (target) {
          handleClick(target, origin)
        }
      })
      .catch(() => undefined)
    return
  }
  if (event.target instanceof Element) {
    handleClick(event.target, origin)
  }
})
