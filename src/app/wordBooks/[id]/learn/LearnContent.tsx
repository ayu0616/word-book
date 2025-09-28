"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { words } from "@/db/schema";
import { client } from "@/lib/hono";

type LearnContentProps = {
  initialWords: (typeof words.$inferSelect)[];
};

export function LearnContent({ initialWords }: LearnContentProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSendIncorrect, setIsSendIncorrect] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [learnedWordsCount, setLearnedWordsCount] = useState(0);

  const currentWordData =
    initialWords.length > 0 && currentWordIndex < initialWords.length
      ? initialWords[currentWordIndex]
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

    if (result === "incorrect") {
      setIsSendIncorrect(true);
      setIncorrectCount((prev) => prev + 1);
    } else {
      setCorrectCount((prev) => prev + 1);
    }
    setLearnedWordsCount((prev) => prev + 1);

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

  if (initialWords.length === 0) {
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
    if (isSendIncorrect) {
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
    <div className="container mx-auto flex justify-center items-center flex-1 p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{currentWordData.term}</CardTitle>
          <div className="text-sm text-muted-foreground">
            <p>学習単語数: {learnedWordsCount}</p>
            <p>正解数: {correctCount}</p>
            <p>不正解数: {incorrectCount}</p>
          </div>
        </CardHeader>
        <CardContent>
          {showMeaning && <p className="mb-4">{currentWordData.meaning}</p>}
          {!showMeaning && (
            <div>
              <Button className="w-full" onClick={handleShowAnswer}>
                答えを見る
              </Button>
            </div>
          )}
          <div className="flex justify-center gap-4">
            {showMeaning && (
              <>
                <Button
                  onClick={() => handleRecordResult("incorrect")}
                  variant="destructive"
                >
                  不正解だった
                </Button>
                <Button onClick={() => handleRecordResult("correct")}>
                  正解した
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
