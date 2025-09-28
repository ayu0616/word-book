"use client";

import { format } from "date-fns";
import {
  EllipsisIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AddWordDialogTrigger } from "@/components/AddWordDialog";
import { EditWordBookTitleModal } from "@/components/EditWordBookTitleModal";
import { EditWordModal } from "@/components/EditWordModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  consecutiveCorrectCount: number;
}

export default function WordBookContent({
  wordBook: initialWordBook,
  words: initialWords,
  wordsToLearnCount,
}: {
  wordBook: WordBook;
  words: Word[];
  wordsToLearnCount: number;
}) {
  const [wordBook, setWordBook] = useState(initialWordBook);
  const [words, setWords] = useState(initialWords);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWords = words.filter(
    (word) =>
      word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href={`/wordBooks/${wordBook.id}/learn`}>
              <PlayIcon className="h-4 w-4" />
              学習を開始
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <EllipsisIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleEditTitleClick}>
                <PencilIcon className="mr-2 h-4 w-4" />
                編集
              </DropdownMenuItem>

              <AddWordDialogTrigger wordBookId={wordBook.id}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  単語を追加
                </DropdownMenuItem>
              </AddWordDialogTrigger>
              <DropdownMenuItem asChild>
                <Link href={`/words/import?wordBookId=${wordBook.id}`}>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  CSVで単語をインポート
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ul className="my-6">
        <li>単語帳ID: {wordBook.id}</li>
        <li>単語数: {words.length}</li>
        <li>今日の学習対象: {wordsToLearnCount}</li>
      </ul>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="単語を検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h2 className="text-xl font-semibold mb-3">単語リスト</h2>
      {words.length === 0 ? (
        <p>この単語帳にはまだ単語がありません。</p>
      ) : filteredWords.length === 0 ? (
        <p>検索条件に一致する単語は見つかりませんでした。</p>
      ) : (
        <ul className="space-y-2">
          {filteredWords.map((word) => (
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
                <p className="text-sm text-gray-500">
                  連続正解数: {word.consecutiveCorrectCount}
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
