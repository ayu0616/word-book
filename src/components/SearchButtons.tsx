import { useCallback } from "react";
import { Button } from "@/components/ui/button";

type SearchButtonsProps = {
  term: string;
};

export function SearchButtons({ term }: SearchButtonsProps) {
  const handleGoogleSearch = useCallback(() => {
    window.open(
      `https://www.google.com/search?q=${term}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [term]);

  const handleChatGPT = useCallback(() => {
    const prompt = encodeURIComponent(`「${term}」について教えてください。`);
    window.open(
      `https://chat.openai.com/chat?q=${prompt}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [term]);

  return (
    <>
      <Button onClick={handleGoogleSearch}>Googleで検索</Button>
      <Button onClick={handleChatGPT}>ChatGPTに聞く</Button>
    </>
  );
}
