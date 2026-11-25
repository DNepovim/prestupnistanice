const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const NUMBER_LENGTH = 6

export const createOrderNumber = () =>
  `PS-${Array.from(crypto.getRandomValues(new Uint8Array(NUMBER_LENGTH)), (byte) =>
    ALPHABET.charAt(byte % ALPHABET.length),
  ).join('')}`
