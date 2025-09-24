"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { words } from "@/db/schema";
import { client } from "@/lib/hono";

type LearnContentProps = {
  initialWords: (typeof words.$inferSelect)[];
};

export function LearnContent({ initialWords }: LearnContentProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordData, setCurrentWordData] = useState<
    typeof words.$inferSelect | null
  >(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true); // Still need loading for initial state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWords.length > 0) {
      setCurrentWordData(initialWords[currentWordIndex]);
      setLoading(false);
    } else {
      setLoading(false);
      setCurrentWordData(null); // No words to learn
    }
  }, [initialWords, currentWordIndex]);

  const moveToNextWord = useCallback(() => {
    setShowMeaning(false);
    if (currentWordIndex < initialWords.length - 1) {
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
    } else {
      setCurrentWordData(null); // All words learned
    }
  }, [currentWordIndex, initialWords]);

  const handleShowAnswer = () => {
    setShowMeaning(true);
  };

  const handleRecordResult = async (result: "correct" | "incorrect") => {
    if (!currentWordData) return;

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!currentWordData) {
    return <p>No more words to learn in this word book.</p>;
  }

  return (
    <div className="container mx-auto flex justify-center items-center flex-1 p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{currentWordData.term}</CardTitle>
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
