import { useState, useEffect } from "react";
import { client } from "../../tina/__generated__/client";

interface BookData {
  slug: string;
  title: string;
  cover?: string;
  color?: string;
  bgColor?: string;
  price?: number;
}

interface UseBookDataResult {
  books: Record<string, BookData>;
  loading: boolean;
  error: string | null;
}

export const useBookData = (slugs: string[]): UseBookDataResult => {
  const [books, setBooks] = useState<Record<string, BookData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (slugs.length === 0) {
        setBooks({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const booksResponse = await client.queries.booksConnection();
        const allBooks = booksResponse.data.booksConnection.edges ?? [];

        // Filter books that match our slugs and create a map
        const booksMap: Record<string, BookData> = allBooks.reduce(
          (acc, edge) => {
            const book = edge?.node;

            return book?.slug && slugs.includes(book.slug)
              ? { ...acc, [book.slug]: book }
              : acc;
          },
          {},
        );

        setBooks(booksMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };

    void fetchBooks();
  }, [slugs]);

  return { books, loading, error };
};

