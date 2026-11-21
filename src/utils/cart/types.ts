export type CartBook = {
  slug: string
  title: string
  author: string
  price: number
  cover: string
}

export type CartIndex = Record<string, CartBook>
