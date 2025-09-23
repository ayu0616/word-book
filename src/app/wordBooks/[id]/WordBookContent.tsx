"use client";

import Link from "next/link";

interface WordBook {
  id: number;
  userId: number;
  title: string;
}

interface Word {
  id: number;
  wordBookId: number;
  term: string;
  meaning: string;
  createdAt: string;
}

export default function WordBookContent({
  wordBook,
  words,
}: {
  wordBook: WordBook;
  words: Word[];
}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{wordBook.title}</h1>
      <p className="mb-4">単語帳ID: {wordBook.id}</p>

      <h2 className="text-xl font-semibold mb-3">単語リスト</h2>
      {words.length === 0 ? (
        <p>この単語帳にはまだ単語がありません。</p>
      ) : (
        <ul className="space-y-2">
          {words.map((word) => (
            <li key={word.id} className="p-3 border rounded-md shadow-sm">
              <p className="font-semibold">{word.term}</p>
              <p className="text-gray-600">{word.meaning}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link
          href={`/words/new?wordBookId=${wordBook.id}`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新しい単語を追加
        </Link>
      </div>
    </div>
  );
}
