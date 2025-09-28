import { Button } from "@/components/ui/button";

type ChatGPTButtonProps = {
  term: string;
};

export function ChatGPTButton({ term }: ChatGPTButtonProps) {
  const prompt = encodeURIComponent(`「${term}」について教えてください。`);
  const chatGPTUrl = `https://chat.openai.com/chat?q=${prompt}`;

  return (
    <Button asChild>
      <a href={chatGPTUrl} target="_blank" rel="noopener noreferrer">
        ChatGPTに聞く
      </a>
    </Button>
  );
}
