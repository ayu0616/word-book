import z from "zod";
import { getServerClient } from "@/lib/hono-server";
import ImportWordsContent from "./ImportWordsContent";

const paramsSchema = z.object({
  wordBookId: z.string().min(1),
});

export default async function ImportWordsPage({
  searchParams,
}: PageProps<"/words/import">) {
  const { wordBookId } = paramsSchema.parse(await searchParams);

  const client = await getServerClient();
  const res = await client.wordBook.get[":id"].$get({
    param: { id: wordBookId },
  });

  if (!res.ok) {
    throw new Error("単語帳の取得に失敗しました");
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error("単語帳の取得に失敗しました");
  }

  return <ImportWordsContent wordBook={data.wordBook} />;
}
