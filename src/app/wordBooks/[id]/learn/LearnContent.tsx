"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LearningRecord } from "@/domain/learningRecord/entities";
import type { Word } from "@/domain/word/entities";

type LearnContentProps = {
  wordBookId: number;
};

export function LearnContent({ wordBookId }: LearnContentProps) {
  const [word, setWord] = useState<Word | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNextWord = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowMeaning(false);
    try {
      const response = await fetch(
        `/api/learning/word-book/${wordBookId}?limit=1`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch next word.");
      }
      const data: { learningRecord: LearningRecord; word: Word }[] =
        await response.json();
      if (data.length > 0) {
        setWord(data[0].word);
      } else {
        setWord(null);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [wordBookId]);

  useEffect(() => {
    fetchNextWord();
  }, [fetchNextWord]);

  const handleShowAnswer = () => {
    setShowMeaning(true);
  };

  const handleRecordResult = async (result: "correct" | "incorrect") => {
    if (!word) return;

    try {
      const response = await fetch("/api/learning/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wordId: word.id, result }),
      });
      if (!response.ok) {
        throw new Error("Failed to record learning result.");
      }
      // After recording, fetch the next word
      fetchNextWord();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!word) {
    return <p>No words to learn in this word book.</p>;
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{word.term}</CardTitle>
      </CardHeader>
      <CardContent>
        {showMeaning && <p className="mb-4">{word.meaning}</p>}
        <div className="flex justify-between">
          {!showMeaning && (
            <Button onClick={handleShowAnswer}>Show Answer</Button>
          )}
          {showMeaning && (
            <>
              <Button
                onClick={() => handleRecordResult("incorrect")}
                variant="destructive"
              >
                Incorrect
              </Button>
              <Button onClick={() => handleRecordResult("correct")}>
                Correct
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
