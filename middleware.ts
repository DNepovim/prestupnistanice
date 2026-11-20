import { next } from '@vercel/functions'

export const config = { matcher: '/interni/:path*' }

const REALM = 'Interni stranky'

const encoder = new TextEncoder()

const digest = async (value: string) =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))

const isSameSecret = async (given: string, expected: string) => {
  const [givenHash, expectedHash] = await Promise.all([digest(given), digest(expected)])
  return (
    givenHash.reduce(
      (diff, byte, index) => diff | (byte ^ (expectedHash[index] ?? 1)),
      0,
    ) === 0
  )
}

const getPassword = (header: string | null) => {
  const [scheme, encoded] = header?.split(' ') ?? []
  if (scheme?.toLowerCase() !== 'basic' || !encoded) {
    return undefined
  }
  const credentials = atob(encoded)
  return credentials.slice(credentials.indexOf(':') + 1)
}

const deny = (status: number) =>
  new Response('Přístup jen pro oprávněné.', {
    status,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })

export default async function middleware(request: Request) {
  const expected = process.env.INTERNAL_PASSWORD
  if (!expected) {
    return deny(503)
  }
  const given = getPassword(request.headers.get('authorization'))
  return given !== undefined && (await isSameSecret(given, expected)) ? next() : deny(401)
}
