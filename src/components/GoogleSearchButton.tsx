import { useCallback } from "react";
import { Button } from "@/components/ui/button";

type GoogleSearchButtonProps = {
  term: string;
};

export function GoogleSearchButton({ term }: GoogleSearchButtonProps) {
  const handleGoogleSearch = useCallback(() => {
    window.open(
      `https://www.google.com/search?q=${term}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [term]);

  return <Button onClick={handleGoogleSearch}>Googleで検索</Button>;
}
