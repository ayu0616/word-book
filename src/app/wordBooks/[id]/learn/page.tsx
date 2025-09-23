import { LearnContent } from "./LearnContent";

type Props = {
  params: {
    id: string;
  };
};

export default function LearnPage({ params }: Props) {
  const wordBookId = Number(params.id);

  return <LearnContent wordBookId={wordBookId} />;
}
