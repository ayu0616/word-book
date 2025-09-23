import { notFound } from "next/navigation";
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
    const { words } = await wordRes.json();

    return <WordBookContent wordBook={wordBook} words={words} />;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("予期せぬエラーが発生しました");
  }
}
