type ChatGPTLinkProps = {
  term: string;
};

export function ChatGPTLink({ term }: ChatGPTLinkProps) {
  const prompt = encodeURIComponent(`「${term}」について教えてください。`);
  const chatGPTUrl = `https://chatgpt.com?q=${prompt}`;

  return (
    <a
      href={chatGPTUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-700 underline hover:text-blue-800"
    >
      ChatGPTに聞く
    </a>
  );
}
