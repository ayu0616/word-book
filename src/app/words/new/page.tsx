import { getServerClient } from "@/lib/hono-server";
import NewWordContent from "./NewWordContent";

export default async function NewWordPage() {
  try {
    const client = await getServerClient();
    const res = await client.wordBook.list.$get();
    if (!res.ok) {
      throw new Error("単語帳の取得に失敗しました");
    }
    const { wordBooks } = await res.json();
    return <NewWordContent wordBooks={wordBooks} />;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("予期せぬエラーが発生しました");
  }
}
