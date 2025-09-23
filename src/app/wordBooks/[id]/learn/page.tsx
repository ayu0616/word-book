import type { words } from "@/db/schema";
import { getServerClient } from "@/lib/hono-server";
import { LearnContent } from "./LearnContent";

type WordSelect = typeof words.$inferSelect;

type RawWordApiResponse = Omit<WordSelect, "createdAt" | "nextReviewDate"> & {
  createdAt: string;
  nextReviewDate: string;
};

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

  const words: WordSelect[] = ((await res.json()) as RawWordApiResponse[])
    .map((word: RawWordApiResponse) => ({
      ...word,
      createdAt: new Date(word.createdAt),
      nextReviewDate: new Date(word.nextReviewDate),
    }))
    .sort(() => Math.random() - 0.5);

  return <LearnContent initialWords={words} />;
}
