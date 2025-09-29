import { notFound } from "next/navigation";
import type { WordProps } from "@/domain/word/entities";
import { getServerClient } from "@/lib/hono-server";
import WordBookContent from "./WordBookContent";

export default async function WordBookPage({
  params,
}: PageProps<"/wordBooks/[id]">) {
  try {
    const client = await getServerClient();
    const { id } = await params;

    const res = await client.wordBook.get[":id"].$get({ param: { id } });
    if (res.status === 404) {
      notFound();
    } else if (!res.ok) {
      throw new Error("単語帳の取得に失敗しました");
    }
    const { wordBook } = await res.json();
    if (!wordBook) {
      throw new Error("単語帳が見つかりませんでした");
    }

    const wordRes = await client.word.list[":wordBookId"].$get({
      param: { wordBookId: id },
    });
    if (!wordRes.ok) {
      throw new Error("単語の取得に失敗しました");
    }
    const { words: rawWords } = await wordRes.json();

    const words: WordProps[] = rawWords.map((w) => ({
      ...w,
      createdAt: new Date(w.createdAt),
      nextReviewDate: new Date(w.nextReviewDate),
    }));

    // 今日の学習対象の残り単語数を取得
    const learningCountRes = await client.learning["word-book"][
      ":wordBookId"
    ].count.$get({
      param: { wordBookId: id },
    });
    if (!learningCountRes.ok) {
      throw new Error("学習対象の単語数の取得に失敗しました");
    }
    const { count: wordsToLearnCount } = await learningCountRes.json();

    return (
      <WordBookContent
        wordBook={wordBook}
        words={words}
        wordsToLearnCount={wordsToLearnCount}
      />
    );
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("予期せぬエラーが発生しました");
  }
}
