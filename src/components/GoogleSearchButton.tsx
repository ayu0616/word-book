import { Button } from "@/components/ui/button";

type GoogleSearchButtonProps = {
  term: string;
};

export function GoogleSearchButton({ term }: GoogleSearchButtonProps) {
  const googleSearchUrl = `https://www.google.com/search?q=${term}`;

  return (
    <Button asChild>
      <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer">
        Googleで検索
      </a>
    </Button>
  );
}
