type GoogleSearchLinkProps = {
  term: string;
};

export function GoogleSearchLink({ term }: GoogleSearchLinkProps) {
  const googleSearchUrl = `https://www.google.com/search?q=${term}`;

  return (
    <a
      href={googleSearchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-700 underline hover:text-blue-800"
    >
      Googleで検索
    </a>
  );
}
