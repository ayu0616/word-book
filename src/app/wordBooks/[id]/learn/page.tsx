import { getServerClient } from "@/lib/hono-server";
import { LearnContent } from "./LearnContent";

export default async function LearnPage({
  params,
}: PageProps<"/wordBooks/[id]/learn">) {
  const wordBookId = (await params).id;

  const client = await getServerClient();
  const res = await client.learning.api.learning["word-book"][
    ":wordBookId"
  ].$get({
    param: { wordBookId },
    query: {},
  });

  if (!res.ok) {
    throw new Error("学習の取得に失敗しました");
  }

  const words = (await res.json())
    .map((word) => ({
      ...word,
      learningRecord: {
        ...word.learningRecord,
        recordDate: new Date(word.learningRecord.recordDate),
        nextReviewDate: new Date(word.learningRecord.nextReviewDate),
        createdAt: new Date(word.learningRecord.createdAt),
        updatedAt: new Date(word.learningRecord.updatedAt),
      },
      word: {
        ...word.word,
        createdAt: new Date(word.word.createdAt),
      },
    }))
    .sort(() => Math.random() - 0.5);

  return <LearnContent initialWords={words} />;
}
