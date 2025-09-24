"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useCallback, useState } from "react";
import { EditWordBookTitleModal } from "@/components/EditWordBookTitleModal";
import { EditWordModal } from "@/components/EditWordModal";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

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
  nextReviewDate: string;
}

export default function WordBookContent({
  wordBook: initialWordBook,
  words: initialWords,
}: {
  wordBook: WordBook;
  words: Word[];
}) {
  const [wordBook, setWordBook] = useState(initialWordBook);
  const [words, setWords] = useState(initialWords);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);

  const handleEditClick = (word: Word) => {
    setEditingWord(word);
    setIsWordModalOpen(true);
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
    setIsWordModalOpen(false);
    setEditingWord(null);
  };

  const handleCloseWordModal = () => {
    setIsWordModalOpen(false);
    setEditingWord(null);
  };

  const handleDeleteClick = useCallback(async (wordId: number) => {
    if (!confirm("Are you sure you want to delete this word?")) {
      return;
    }

    try {
      const res = await client.word[":id"].$delete({
        param: { id: wordId.toString() },
      });

      if (!res.ok) {
        throw new Error("Failed to delete word.");
      }

      // Update the UI by removing the deleted word
      setWords((prevWords) => prevWords.filter((word) => word.id !== wordId));
    } catch (error) {
      console.error("Error deleting word:", error);
      // Optionally, display an error message to the user
    }
  }, []);

  const handleEditTitleClick = () => {
    setIsTitleModalOpen(true);
  };

  const handleSaveTitle = (newTitle: string) => {
    setWordBook((prevWordBook) => ({ ...prevWordBook, title: newTitle }));
    setIsTitleModalOpen(false);
  };

  const handleCloseTitleModal = () => {
    setIsTitleModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold mr-4">{wordBook.title}</h1>
        <Button variant="outline" size="sm" onClick={handleEditTitleClick}>
          編集
        </Button>
      </div>
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
                  作成日: {format(new Date(word.createdAt), "yyyy-MM-dd")}
                </p>
                <p className="text-sm text-gray-500">
                  次回の復習日:{" "}
                  {format(new Date(word.nextReviewDate), "yyyy-MM-dd")}
                </p>
              </div>
              <div className="flex gap-2 items-center">
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
              </div>
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
          isOpen={isWordModalOpen}
          onClose={handleCloseWordModal}
          word={editingWord}
          onSave={handleSaveWord}
        />
      )}

      <EditWordBookTitleModal
        isOpen={isTitleModalOpen}
        onClose={handleCloseTitleModal}
        wordBookId={wordBook.id}
        currentTitle={wordBook.title}
        onSave={handleSaveTitle}
      />
    </div>
  );
}
