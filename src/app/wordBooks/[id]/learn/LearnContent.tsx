"use client";

import { useCallback, useState } from "react";
import { ChatGPTLink } from "@/components/ChatGPTLink";
import { GoogleSearchLink } from "@/components/GoogleSearchLink";
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
  const [learningStats, setLearningStats] = useState({
    correctCount: 0,
    incorrectCount: 0,
  });

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
                  {learningStats.correctCount + learningStats.incorrectCount} /{" "}
                  {initialWords.length}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="flex flex-1 justify-center items-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{currentWordData.term}</CardTitle>
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
  );
}
