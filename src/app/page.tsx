import { getServerClient } from "@/lib/hono-server";
import HomeContent from "./HomeContent";

export default async function HomePage() {
  const client = await getServerClient();
  const res = await client.wordBook.list.$get();
  if (!res.ok) {
    throw new Error("単語帳の取得に失敗しました");
  }
  const { wordBooks } = await res.json();
  const error = null;

  return <HomeContent wordBooks={wordBooks} error={error} />;
}
