import { LearningRecordService } from "@/application/learningRecord/service";
import { DrizzleLearningRecordRepository } from "@/infrastructure/learningRecord/repository.drizzle";
import { LearnContent } from "./LearnContent";

type Props = {
  params: {
    id: string;
  };
};

// Fisher-Yates (Knuth) shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export default async function LearnPage({ params }: Props) {
  const wordBookId = Number(params.id);

  const learningRecordService = new LearningRecordService(
    new DrizzleLearningRecordRepository(),
  );

  const wordsToLearn = await learningRecordService.getWordsToLearn(
    wordBookId,
    1000, // Fetch a large number to get all relevant words
  );

  const shuffledWords = shuffleArray(wordsToLearn);

  return <LearnContent initialWords={shuffledWords} />;
}
