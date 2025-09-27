import { useRouter } from "next/navigation";
import type { FC } from "react";
import { client } from "@/lib/hono";
import { AddWordForm, type AddWordFormData } from "./AddWordForm";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

interface AddWordDialogProps {
  wordBookId: number;
}

export const AddWordDialog: FC<AddWordDialogProps> = ({ wordBookId }) => {
  const router = useRouter();

  const onSubmit = async (values: AddWordFormData) => {
    const res = await client.word.create.$post({
      json: {
        wordBookId,
        term: values.term,
        meaning: values.meaning,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      console.error(data.error ?? "単語の登録に失敗しました。");
    }

    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>単語を追加</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>単語を追加</DialogTitle>
        <AddWordForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};
