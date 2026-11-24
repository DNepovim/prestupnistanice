export type CartBook = {
  slug: string
  title: string
  author: string
  price: number
  cover: string
  color: string
}

export type CartIndex = Record<string, CartBook>
