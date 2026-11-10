<script lang="ts">
  import 'iconify-icon'

  import { onMount } from 'svelte'

  import { routes } from '@/routes'
  import type { KosmasStatus } from '@/utils/kosmas'

  export let href: string
  export let slug: string
  let className = ''
  export { className as class }

  const UNAVAILABLE_MESSAGES = {
    available: undefined,
    outOfStock: 'Na Kosmasu momentálně není skladem',
    soldOut: 'Kniha je vyprodaná',
  } as const satisfies Record<KosmasStatus, string | undefined>

  const isKosmasStatus = (value: unknown): value is KosmasStatus =>
    typeof value === 'string' && value in UNAVAILABLE_MESSAGES

  let status: KosmasStatus = 'available'

  $: message = UNAVAILABLE_MESSAGES[status]

  onMount(async () => {
    const response = await fetch(routes.api.kosmasStatus(slug)).catch(() => undefined)
    const body: { status?: unknown } | undefined = response?.ok
      ? await response.json().catch(() => undefined)
      : undefined
    status = isKosmasStatus(body?.status) ? body.status : 'available'
  })
</script>

{#if message}
  <p
    class={[
      'font-alt flex items-center gap-2 text-sm tracking-wider text-gray-500 uppercase',
      className,
    ]}
  >
    <iconify-icon icon="ph:package" noobserver aria-hidden="true"></iconify-icon>
    {message}
  </p>
{:else}
  <a
    {href}
    target="_blank"
    rel="noopener"
    class={[
      'font-alt group text-brand-second-500 relative text-sm font-semibold tracking-wider uppercase',
      className,
    ]}
  >
    Kup na Kosmasu
    <span class="sr-only">(otevře se v novém okně)</span>
    <span
      class="border-brand-second-500 absolute -right-7 bottom-1/2 block size-2 translate-y-1/2 rotate-45 border-t border-r"
    ></span>
    <span
      class="bg-brand-second-500 absolute -right-[29px] bottom-1/2 block h-[1px] w-4 translate-y-1/2 transition-all duration-500 group-hover:w-[calc(100%+2rem)]"
    ></span>
  </a>
{/if}
