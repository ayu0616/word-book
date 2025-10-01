"use client";

import { EditIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { ChatGPTLink } from "@/components/ChatGPTLink";
import { EditWordModal } from "@/components/EditWordModal";
import { GoogleSearchLink } from "@/components/GoogleSearchLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WordProps } from "@/domain/word/entities";
import { client } from "@/lib/hono";

type LearnContentProps = {
  initialWords: WordProps[];
};

export function LearnContent({ initialWords }: LearnContentProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningStats, setLearningStats] = useState({
    correctCount: 0,
    incorrectCount: 0,
  });

  // 単語編集モーダルの状態管理
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // 編集後の単語リスト
  const [words, setWords] = useState<WordProps[]>(initialWords);

  const currentWordData =
    words.length > 0 && currentWordIndex < words.length
      ? words[currentWordIndex]
      : null;

  const moveToNextWord = useCallback(() => {
    setShowMeaning(false);
    setCurrentWordIndex((prevIndex) => prevIndex + 1);
  }, []);

  const handleShowAnswer = () => {
    setShowMeaning(true);
  };

  const handleRecordResult = async (result: "correct" | "incorrect") => {
    if (!currentWordData) return;
    setLearningStats((prev) => {
      if (result === "correct") {
        return { ...prev, correctCount: prev.correctCount + 1 };
      }
      return { ...prev, incorrectCount: prev.incorrectCount + 1 };
    });

    try {
      const res = await client.learning.record.$post({
        json: { wordId: currentWordData.id, result },
      });
      if (!res.ok) {
        throw new Error("Failed to record learning result.");
      }
      // After recording, move to the next word in the local list
      moveToNextWord();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 編集ボタン押下時
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  // 編集モーダルの保存時
  const handleEditSave = (updatedWord: {
    id: string;
    term: string;
    meaning: string;
  }) => {
    setWords((prevWords) =>
      prevWords.map((word) =>
        word.id === updatedWord.id
          ? { ...word, term: updatedWord.term, meaning: updatedWord.meaning }
          : word,
      ),
    );
    setIsEditModalOpen(false);
  };

  // 編集モーダルのクローズ時
  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };

  if (words.length === 0) {
    return (
      <div className="container mx-auto flex justify-center items-center flex-1 p-4">
        <p>本日の学習は完了しました。</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!currentWordData) {
    if (learningStats.incorrectCount > 0) {
      return (
        <div className="container mx-auto flex flex-col gap-4 justify-center items-center flex-1 p-4">
          <p>リロードして間違えた単語を復習してください。</p>
          <div>
            <Button onClick={() => window.location.reload()}>リロード</Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container mx-auto flex justify-center items-center flex-1 p-4">
          <p>本日の学習は完了しました。</p>
        </div>
      );
    }
  }

  return (
    <>
      <div className="container mx-auto flex flex-1 p-4 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>学習状況</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="text-sm text-muted-foreground">
              <tbody>
                <tr>
                  <td className="pr-4">正解数</td>
                  <td>{learningStats.correctCount}</td>
                </tr>
                <tr>
                  <td className="pr-4">不正解数</td>
                  <td>{learningStats.incorrectCount}</td>
                </tr>
                <tr>
                  <td className="pr-4">学習済み単語数</td>
                  <td>
                    {learningStats.correctCount + learningStats.incorrectCount}{" "}
                    / {words.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        <div className="flex flex-1 justify-center items-center">
          <Card className="w-full">
            <CardHeader className="flex-row items-center">
              <CardTitle className="flex-1 mb-0">
                {currentWordData.term}
              </CardTitle>
              {showMeaning && (
                <Button size="icon" variant="ghost" onClick={handleEditClick}>
                  <EditIcon />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showMeaning && (
                <p className="mb-4 whitespace-pre-wrap">
                  {currentWordData.meaning}
                </p>
              )}
              {!showMeaning && (
                <div>
                  <Button className="w-full" onClick={handleShowAnswer}>
                    答えを見る
                  </Button>
                </div>
              )}
              {showMeaning && (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => handleRecordResult("incorrect")}
                      variant="destructive"
                    >
                      不正解だった
                    </Button>
                    <Button onClick={() => handleRecordResult("correct")}>
                      正解した
                    </Button>
                  </div>
                  <div className="flex justify-center gap-4">
                    <GoogleSearchLink term={currentWordData.term} />
                    <ChatGPTLink term={currentWordData.term} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <EditWordModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        word={currentWordData}
        onSave={handleEditSave}
      />
    </>
  );
}
