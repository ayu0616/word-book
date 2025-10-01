"use client";

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

interface LearningStats {
  correctCount: number;
  incorrectCount: number;
}

export function LearnContent({ initialWords }: LearnContentProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learningStats, setLearningStats] = useState<LearningStats>({
    correctCount: 0,
    incorrectCount: 0,
  });

  // 編集後の単語リスト
  const [words, setWords] = useState<WordProps[]>(initialWords);

  const currentWordData =
    words.length > 0 && currentWordIndex < words.length
      ? words[currentWordIndex]
      : null;

  const moveToNextWord = useCallback(() => {
    setCurrentWordIndex((prevIndex) => prevIndex + 1);
    setShowMeaning(false);
  }, []);

  const handleShowAnswer = () => {
    setShowMeaning(true);
  };

  const handleRecordResult = async (result: "correct" | "incorrect") => {
    if (!currentWordData) return;

    try {
      await client.learning.record.$post({
        json: {
          wordId: currentWordData.id,
          result,
        },
      });

      setLearningStats((prevStats) =>
        result === "correct"
          ? { ...prevStats, correctCount: prevStats.correctCount + 1 }
          : { ...prevStats, incorrectCount: prevStats.incorrectCount + 1 },
      );
      moveToNextWord();
    } catch (error) {
      console.error("学習結果の記録エラー:", error);
    }
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
  };

  if (words.length === 0) {
    return (
      <div className="container mx-auto flex justify-center items-center flex-1 p-4">
        <p>本日の学習は完了しました。</p>
      </div>
    );
  }

  if (!currentWordData) {
    return (
      <div className="container mx-auto flex justify-center items-center flex-1 p-4">
        <p>単語帳に単語がありません。</p>
      </div>
    );
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
                  {words.length}
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
              <EditWordModal word={currentWordData} onSave={handleEditSave} />
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
  );
}
