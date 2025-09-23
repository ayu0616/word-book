export default async function WordBookPage({
  params,
}: PageProps<"/wordBooks/[id]">) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">単語帳詳細ページ</h1>
      <p>単語帳ID: {id}</p>
      {/* ここに単語帳の詳細や単語リストなどを表示 */}
    </div>
  );
}
