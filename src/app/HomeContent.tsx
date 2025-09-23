"use client";

import Link from "next/link";
import { useState } from "react";

interface WordBook {
  id: number;
  userId: number;
  title: string;
}

export default function HomeContent({
  wordBooks,
  error,
}: {
  wordBooks: WordBook[];
  error: string | null;
}) {
  const [localError, _setLocalError] = useState<string | null>(error);

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
            <li key={wordBook.id} className="p-3 border rounded-md shadow-sm">
              <Link
                href={`/wordBooks/${wordBook.id}`}
                className="text-blue-600 hover:underline"
              >
                {wordBook.title}
              </Link>
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
