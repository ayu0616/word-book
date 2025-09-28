import { useCallback } from "react";
import { Button } from "@/components/ui/button";

type ChatGPTButtonProps = {
  term: string;
};

export function ChatGPTButton({ term }: ChatGPTButtonProps) {
  const handleChatGPT = useCallback(() => {
    const prompt = encodeURIComponent(`「${term}」について教えてください。`);
    window.open(
      `https://chat.openai.com/chat?q=${prompt}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [term]);

  return <Button onClick={handleChatGPT}>ChatGPTに聞く</Button>;
}
