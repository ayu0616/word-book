"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/lib/hono";

interface WordBook {
  id: number;
  userId: number;
  title: string;
}

export default function HomePage() {
  const [wordBooks, setWordBooks] = useState<WordBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordBooks = async () => {
      try {
        const res = await client.wordBook.list.$get();
        const data = await res.json();
        if (data.ok) {
          setWordBooks(data.wordBooks);
        } else {
          setError(data.error ?? "単語帳の取得に失敗しました");
        }
      } catch (_err) {
        setError("ネットワークエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    fetchWordBooks();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-600">エラー: {error}</div>
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
