"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { WordBookProps } from "@/domain/wordBook/word-book.entity";
import { client } from "@/lib/hono";

export default function HomeContent({
  wordBooks: initialWordBooks,
  error,
}: {
  wordBooks: WordBookProps[];
  error: string | null;
}) {
  const [wordBooks, setWordBooks] = useState(initialWordBooks);
  const [localError, _setLocalError] = useState<string | null>(error);

  const handleDeleteClick = useCallback(async (wordBookId: string) => {
    if (!confirm("Are you sure you want to delete this word book?")) {
      return;
    }

    try {
      const res = await client.wordBook[":id"].$delete({
        param: { id: wordBookId.toString() },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete word book.");
      }

      // Update the UI by removing the deleted word book
      setWordBooks((prevWordBooks) =>
        prevWordBooks.filter((wordBook) => wordBook.id !== wordBookId),
      );
    } catch (error: unknown) {
      console.error("Error deleting word book:", error);
      // Optionally, display an error message to the user
    }
  }, []);

  if (localError) {
    return (
      <div className="container mx-auto p-4 text-red-600">
        エラー: {localError}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">あなたの単語帳</h1>
      {wordBooks.length === 0 ? (
        <p>単語帳がありません。新しい単語帳を作成しましょう！</p>
      ) : (
        <ul className="space-y-2">
          {wordBooks.map((wordBook) => (
            <li
              key={wordBook.id}
              className="p-3 border rounded-md shadow-sm flex justify-between items-center"
            >
              <div>
                <Link
                  href={`/wordBooks/${wordBook.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {wordBook.title}
                </Link>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDeleteClick(wordBook.id)}
              >
                削除
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 space-x-4">
        <Button asChild>
          <Link href="/wordBooks/new">新しい単語帳を作成</Link>
        </Button>
        <Button asChild>
          <Link href="/words/new">新しい単語を登録</Link>
        </Button>
      </div>
    </div>
  );
}
