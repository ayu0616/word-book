import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { client } from "@/lib/hono";
import ImportWordsContent from "./ImportWordsContent";

export default async function ImportWordsPage({
  searchParams,
}: {
  searchParams: { wordBookId?: string };
}) {
  const wordBookId = searchParams.wordBookId;

  if (!wordBookId) {
    redirect("/");
  }

  const sid = getCookie("sid", { cookies });
  if (!sid) {
    redirect("/login");
  }

  const res = await client.wordBook.get[":id"].$get({
    param: { id: wordBookId },
  });

  if (!res.ok) {
    redirect("/");
  }

  const data = await res.json();
  if (!data.ok) {
    redirect("/");
  }

  return <ImportWordsContent wordBook={data.wordBook} />;
}
