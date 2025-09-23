import { getServerClient } from "@/lib/hono-server";
import { LearnContent } from "./LearnContent";

export default async function LearnPage({
  params,
}: PageProps<"/wordBooks/[id]/learn">) {
  const _wordBookId = Number.parseInt((await params).id, 10);

  const _client = await getServerClient();
  // const res = await client.

  return <LearnContent initialWords={[]} />;
}
