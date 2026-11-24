<script lang="ts">
  import { tick } from 'svelte'

  import ProofCropMarks from '@/components/ProofCropMarks.svelte'
  import ProofResult from '@/components/ProofResult.svelte'
  import { evaluate } from '@/utils/proofGame/evaluate'
  import {
    getLine,
    PROOF_PAGES,
    PROOF_RECORDS,
    PROOF_WORDS,
    splitOddGlyph,
    type Line,
    type LineKind,
    type Word,
  } from '@/utils/proofGame/text'
  import { tp } from '@/utils/tp'

  type Outcome = 'hit' | 'miss' | 'falsePositive' | 'none'

  const PAGE_SIDES = ['left', 'right'] as const

  const PAGE_SIDE_CLASSES = {
    left: '@min-[40rem]:after:right-0 @min-[40rem]:after:bg-linear-to-r',
    right: '@min-[40rem]:after:left-0 @min-[40rem]:after:bg-linear-to-l',
  } as const satisfies Record<(typeof PAGE_SIDES)[number], string>

  const LINE_KIND_CLASSES = {
    h: 'text-center [text-align-last:center] font-head text-[1.5em] font-extrabold text-gray-800',
    g: 'h-[1.34em]',
    f: 'text-justify [text-align-last:justify] indent-[1.4em]',
    m: 'text-justify [text-align-last:justify]',
    e: 'text-justify [text-align-last:left]',
    u: 'text-justify [text-align-last:justify]',
  } as const satisfies Record<LineKind, string>

  const OUTCOME_CLASSES = {
    hit: 'after:text-gray-700',
    miss: 'bg-brand-second-700/15 shadow-[0_0.1em_0_var(--color-brand-second-700)] after:text-brand-second-700',
    falsePositive: 'line-through decoration-brand-second-700 decoration-[0.12em]',
    none: '',
  } as const satisfies Record<Outcome, string>

  const WORD_CLASS =
    'group/word relative hover:z-20 focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700 before:pointer-events-none before:absolute before:inset-[0.1em_-0.1em_0.02em_-0.1em] before:origin-left before:scale-x-0 before:bg-brand-second-300 before:mix-blend-multiply before:[clip-path:polygon(0_14%,3%_0,100%_8%,96%_100%,2%_90%)] after:pointer-events-none after:absolute after:bottom-[90%] after:left-0 after:z-[2] after:origin-bottom-left after:-rotate-3 after:font-alt after:text-[0.85em] after:leading-none after:font-semibold after:whitespace-nowrap after:italic after:content-[attr(data-tag)]'

  const SELECTED_CLASS =
    'before:scale-x-100 before:transition-transform before:duration-300 before:ease-out motion-reduce:before:transition-none'

  const OPEN_CLASS =
    'cursor-highlighter hover:shadow-[inset_0_-0.1em_0_color-mix(in_srgb,var(--color-gray-600)_40%,transparent)]'

  const HANG_SHARE = 0.5

  const HANGING = new Set(['.', ',', ';', ':', '!', '?', '“', '”', '’', ')', '-', '…'])

  const BUTTON_CLASS =
    'bg-brand-first-700 hover:bg-brand-first-800 px-[1.6rem] py-[0.8rem] text-sm font-semibold tracking-[0.03em] text-white transition-colors motion-reduce:transition-none'

  let selected = $state<ReadonlySet<number>>(new Set())
  let isSubmitted = $state(false)
  let focusIndex = $state(0)
  let submitButton = $state<HTMLButtonElement>()
  let againButton = $state<HTMLButtonElement>()

  let pagesElement = $state<HTMLElement>()

  let drag: { isOn: boolean } | null = null
  let touchTap: number | null = null
  const wordElements: (HTMLElement | undefined)[] = []

  const getHang = (line: Line, word: Word) => {
    const isJustified = line.kind === 'f' || line.kind === 'm' || line.kind === 'u'
    const isLast = line.words.at(-1)?.index === word.index
    const mark = word.text.slice(-1)
    if (!isJustified || !isLast || word.text.length < 2 || !HANGING.has(mark))
      return undefined
    return { body: word.text.slice(0, -1), mark }
  }

  const measureHangs = () => {
    pagesElement?.querySelectorAll<HTMLElement>('[data-hang]').forEach((element) => {
      const width = element.getBoundingClientRect().width
      const size = parseFloat(window.getComputedStyle(element).fontSize)
      if (width > 0 && size > 0)
        element.style.marginRight = `${String((-width * HANG_SHARE) / size)}em`
    })
  }

  $effect(() => {
    if (!pagesElement) return
    const observer = new ResizeObserver(measureHangs)
    observer.observe(pagesElement)
    void document.fonts.ready.then(measureHangs)
    return () => {
      observer.disconnect()
    }
  })

  const evaluation = $derived(evaluate(selected))
  const result = $derived(isSubmitted ? evaluation : null)

  const setWord = (index: number, isOn: boolean) => {
    if (isSubmitted || selected.has(index) === isOn) return
    selected = isOn
      ? new Set([...selected, index])
      : new Set([...selected].filter((other) => other !== index))
  }

  const toggleWord = (index: number) => {
    setWord(index, !selected.has(index))
  }

  const getOutcome = (word: Word): Outcome => {
    if (!result) return 'none'
    const record = word.recordId ? PROOF_RECORDS.get(word.recordId) : undefined
    if (record?.kind === 'error') return result.found.includes(record) ? 'hit' : 'miss'
    return selected.has(word.index) ? 'falsePositive' : 'none'
  }

  const getTag = (word: Word) => {
    const record = word.recordId ? PROOF_RECORDS.get(word.recordId) : undefined
    if (!result || record?.kind !== 'error' || record.area[0] !== word.index)
      return undefined
    return `${result.found.includes(record) ? '✓ ' : ''}${record.tag}`
  }

  const getNote = (word: Word) => {
    const record = word.recordId ? PROOF_RECORDS.get(word.recordId) : undefined
    if (!result || !record) return undefined
    return record.kind === 'error' || selected.has(word.index)
      ? record.description
      : undefined
  }

  const getCenterX = (word: Word) => {
    const rect = wordElements[word.index]?.getBoundingClientRect()
    return rect ? rect.left + rect.width / 2 : 0
  }

  const findVertical = (word: Word, direction: 1 | -1) => {
    const target = [1, 2, 3]
      .map((step) => getLine(word.line + direction * step))
      .find((line) => line !== undefined && line.words.length > 0)
    if (!target) return word.index
    const x = getCenterX(word)
    return target.words.reduce((best, candidate) =>
      Math.abs(getCenterX(candidate) - x) < Math.abs(getCenterX(best) - x)
        ? candidate
        : best,
    ).index
  }

  const moveFocus = async (index: number) => {
    const target = Math.max(0, Math.min(PROOF_WORDS.length - 1, index))
    focusIndex = target
    await tick()
    wordElements[target]?.focus()
  }

  const MOVES = new Map<string, (word: Word) => number>([
    ['ArrowRight', (word) => word.index + 1],
    ['ArrowLeft', (word) => word.index - 1],
    ['ArrowDown', (word) => findVertical(word, 1)],
    ['ArrowUp', (word) => findVertical(word, -1)],
  ])

  const handleKeyDown = (event: KeyboardEvent, word: Word) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleWord(word.index)
      return
    }
    const move = MOVES.get(event.key)
    if (!move) return
    event.preventDefault()
    void moveFocus(move(word))
  }

  const handlePointerDown = (event: PointerEvent, index: number) => {
    if (isSubmitted || event.button > 0) return
    if (event.pointerType === 'touch') {
      touchTap = index
      return
    }
    const isOn = !selected.has(index)
    drag = { isOn }
    setWord(index, isOn)
  }

  const handlePointerEnter = (event: PointerEvent, index: number) => {
    if (drag && event.buttons > 0) setWord(index, drag.isOn)
  }

  const handlePointerUp = (index: number) => {
    if (touchTap === index) toggleWord(index)
  }

  const endPointer = () => {
    drag = null
    touchTap = null
  }

  const submit = async () => {
    isSubmitted = true
    await tick()
    againButton?.focus()
  }

  const restart = async () => {
    endPointer()
    selected = new Set()
    isSubmitted = false
    await tick()
    submitButton?.focus()
  }
</script>

<svelte:window onpointerup={endPointer} onpointercancel={endPointer} />

<div class="@container overflow-x-clip">
  <div
    class="mx-auto grid max-w-[84rem] gap-4 px-[0.6rem] pt-[0.4rem] pb-[1.2rem] @min-[40rem]:px-4"
  >
    <div
      bind:this={pagesElement}
      class="relative mx-auto mt-[1.6rem] mb-4 grid w-[calc(100%-2.2rem)] max-w-[32rem] grid-cols-[minmax(0,1fr)] gap-8 @min-[40rem]:mt-8 @min-[40rem]:w-[calc(100%-3rem)] @min-[40rem]:max-w-[76rem] @min-[40rem]:grid-cols-2 @min-[40rem]:gap-0"
    >
      {#each PROOF_PAGES as page, pageIndex (page.number)}
        {@const side = PAGE_SIDES[pageIndex] ?? 'right'}
        <div
          role="group"
          aria-label={tp(`Strana ${String(page.number)}`)}
          class={[
            '@container relative flex flex-col bg-white [--cm-l:0.6rem] [--cm-s:1.1rem] [--pad:8] [--text:84] shadow-[0_0.25rem_1.1rem_rgba(0,0,0,0.18)] @min-[40rem]:[--cm-l:0.8rem] @min-[40rem]:[--cm-s:1.4rem] @min-[40rem]:[--pad:12] @min-[40rem]:[--text:76]',
            '@min-[40rem]:after:pointer-events-none @min-[40rem]:after:absolute @min-[40rem]:after:inset-y-0 @min-[40rem]:after:w-[6%] @min-[40rem]:after:from-transparent @min-[40rem]:after:to-gray-900/10',
            PAGE_SIDE_CLASSES[side],
          ]}
        >
          <ProofCropMarks {side} />
          <div
            class="font-head flex flex-1 touch-pan-y flex-col px-[calc(var(--pad)*1cqw)] pt-[7cqw] pb-[5cqw] text-[length:calc(var(--text)*1cqw/26.2)] leading-[1.34] text-gray-900 select-none [-webkit-touch-callout:none]"
          >
            <div>
              {#each page.lines as line (line.number)}
                <div
                  aria-hidden={line.kind === 'g' ? 'true' : undefined}
                  class={[
                    'block [font-feature-settings:"liga"] leading-[1.34] whitespace-nowrap hyphens-none',
                    LINE_KIND_CLASSES[line.kind],
                  ]}
                >
                  {#each line.words as word (word.index)}
                    {@const glyph = splitOddGlyph(word.text)}
                    {@const hang = glyph.glyph ? undefined : getHang(line, word)}
                    {@const note = getNote(word)}
                    <span
                      bind:this={wordElements[word.index]}
                      role="button"
                      tabindex={word.index === focusIndex ? 0 : -1}
                      aria-pressed={selected.has(word.index)}
                      aria-disabled={isSubmitted}
                      aria-label={word.isGap ? tp('mezera navíc') : undefined}
                      data-tag={getTag(word)}
                      class={[
                        WORD_CLASS,
                        word.isGap &&
                          'visible -mx-[0.15em] box-content inline-block h-[1em] w-[0.3em] bg-clip-content px-[0.15em] align-baseline',
                        word.isOnRight &&
                          'after:right-0 after:left-auto after:origin-bottom-right',
                        selected.has(word.index) && SELECTED_CLASS,
                        !isSubmitted && OPEN_CLASS,
                        OUTCOME_CLASSES[getOutcome(word)],
                      ]}
                      onpointerdown={(event) => {
                        handlePointerDown(event, word.index)
                      }}
                      onpointerenter={(event) => {
                        handlePointerEnter(event, word.index)
                      }}
                      onpointerup={() => {
                        handlePointerUp(word.index)
                      }}
                      onclick={(event) => {
                        if (event.detail === 0) toggleWord(word.index)
                      }}
                      onfocus={() => {
                        focusIndex = word.index
                      }}
                      onkeydown={(event) => {
                        handleKeyDown(event, word)
                      }}
                      >{#if hang}{hang.body}<span data-hang>{hang.mark}</span
                        >{:else if glyph.glyph}{glyph.before}<span
                          class="font-display text-[0.92em] font-bold">{glyph.glyph}</span
                        >{glyph.after}{:else}{word.text}{/if}{#if note}<span
                          role="tooltip"
                          class={[
                            'font-alt pointer-events-none invisible absolute top-full z-30 mt-[0.35rem] w-max max-w-[14rem] bg-gray-900 px-[0.6rem] py-[0.4rem] text-left text-[0.8rem] leading-[1.35] font-medium whitespace-normal text-white opacity-0 shadow-[0_0.2rem_0.7rem_rgba(0,0,0,0.25)] [text-align-last:left] [text-decoration:none] not-italic transition-opacity duration-150 group-hover/word:visible group-hover/word:opacity-100 group-focus/word:visible group-focus/word:opacity-100 motion-reduce:transition-none',
                            word.isOnRight ? 'right-0' : 'left-0',
                          ]}>{note}</span
                        >{/if}</span
                    >{word.separator}
                  {/each}
                </div>
              {/each}
            </div>
            <div
              aria-hidden="true"
              class="font-head mt-auto pt-[1.3em] text-center text-[0.95em] leading-none font-semibold text-gray-700 [font-feature-settings:'lnum']"
            >
              {page.number}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="mx-auto mt-[0.4rem] grid w-full max-w-[44rem] gap-4 px-[0.4rem]">
      <div class="flex justify-center">
        {#if isSubmitted}
          <button
            bind:this={againButton}
            type="button"
            class={BUTTON_CLASS}
            onclick={restart}
          >
            {tp('Zkusit znovu')}
          </button>
        {:else}
          <button
            bind:this={submitButton}
            type="button"
            class={BUTTON_CLASS}
            onclick={submit}
          >
            {tp('Odeslat korekturu')}
          </button>
        {/if}
      </div>
      <div aria-live="polite" class="grid min-h-px gap-[0.7rem]">
        {#if result}
          <ProofResult {result} />
        {/if}
      </div>
    </div>
  </div>
</div>
