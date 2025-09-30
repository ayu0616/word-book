"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/hono";

interface EditWordBookTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordBookId: string;
  currentTitle: string;
  onSave: (newTitle: string) => void;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }).max(255),
});

type FormData = z.infer<typeof formSchema>;

export function EditWordBookTitleModal({
  isOpen,
  onClose,
  wordBookId,
  currentTitle,
  onSave,
}: EditWordBookTitleModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentTitle,
    },
  });

  useEffect(() => {
    form.reset({ title: currentTitle });
  }, [currentTitle, form]);

  const onSubmit = async (values: FormData) => {
    try {
      const res = await client.wordBook[":id"].$put({
        param: { id: wordBookId.toString() },
        json: values,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "単語帳タイトルの更新に失敗しました。");
      }

      onSave(values.title);
      onClose();
    } catch (error: unknown) {
      console.error("単語帳タイトル更新エラー:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>単語帳タイトルを編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">変更を保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
