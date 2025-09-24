"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { client } from "@/lib/hono";

interface WordBook {
  id: number;
  userId: number;
  title: string;
}

export default function HomeContent({
  wordBooks: initialWordBooks,
  error,
}: {
  wordBooks: WordBook[];
  error: string | null;
}) {
  const [wordBooks, setWordBooks] = useState(initialWordBooks);
  const [localError, _setLocalError] = useState<string | null>(error);

  const handleDeleteClick = useCallback(async (wordBookId: number) => {
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
              <button
                type="button"
                onClick={() => handleDeleteClick(wordBook.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 space-x-4">
        <Link
          href="/wordBooks/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新しい単語帳を作成
        </Link>
        <Link
          href="/words/new"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          新しい単語を登録
        </Link>
      </div>
    </div>
  );
}
