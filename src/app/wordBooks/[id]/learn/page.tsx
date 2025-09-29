import type { WordProps } from "@/domain/word/entities";
import { getServerClient } from "@/lib/hono-server";
import { LearnContent } from "./LearnContent";

export default async function LearnPage({
  params,
}: PageProps<"/wordBooks/[id]/learn">) {
  const wordBookId = (await params).id;

  const client = await getServerClient();
  const res = await client.learning["word-book"][":wordBookId"].$get({
    param: { wordBookId },
  });

  if (!res.ok) {
    throw new Error("学習の取得に失敗しました");
  }

  const words: WordProps[] = (await res.json())
    .map((word) => ({
      ...word,
      createdAt: new Date(word.createdAt),
      nextReviewDate: new Date(word.nextReviewDate),
    }))
    .sort(() => Math.random() - 0.5);

  return <LearnContent initialWords={words} />;
}
