"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { EditWordModal } from "@/components/EditWordModal";
import { Button } from "@/components/ui/button";

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
  words: initialWords,
}: {
  wordBook: WordBook;
  words: Word[];
}) {
  const [words, setWords] = useState(initialWords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const handleEditClick = (word: Word) => {
    setEditingWord(word);
    setIsModalOpen(true);
  };

  const handleSaveWord = (updatedWord: {
    id: number;
    term: string;
    meaning: string;
  }) => {
    setWords((prevWords) =>
      prevWords.map((word) =>
        word.id === updatedWord.id ? { ...word, ...updatedWord } : word,
      ),
    );
    setIsModalOpen(false);
    setEditingWord(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWord(null);
  };

  const handleDeleteClick = useCallback(async (wordId: number) => {
    if (!confirm("Are you sure you want to delete this word?")) {
      return;
    }

    try {
      const response = await fetch(`/api/word/${wordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete word.");
      }

      // Update the UI by removing the deleted word
      setWords((prevWords) => prevWords.filter((word) => word.id !== wordId));
    } catch (error) {
      console.error("Error deleting word:", error);
      // Optionally, display an error message to the user
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{wordBook.title}</h1>
      <p className="mb-4">単語帳ID: {wordBook.id}</p>
      <p className="mb-4">単語数: {words.length}</p>

      <h2 className="text-xl font-semibold mb-3">単語リスト</h2>
      {words.length === 0 ? (
        <p>この単語帳にはまだ単語がありません。</p>
      ) : (
        <ul className="space-y-2">
          {words.map((word) => (
            <li
              key={word.id}
              className="p-3 border rounded-md shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{word.term}</p>
                <p className="text-gray-600">{word.meaning}</p>
                <p className="text-sm text-gray-500">
                  作成日: {new Date(word.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(word)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(word.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex space-x-4">
        <Link
          href={`/wordBooks/${wordBook.id}/learn`}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          学習を開始
        </Link>
        <Link
          href={`/words/new?wordBookId=${wordBook.id}`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新しい単語を追加
        </Link>
      </div>

      {editingWord && (
        <EditWordModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          word={editingWord}
          onSave={handleSaveWord}
        />
      )}
    </div>
  );
}
