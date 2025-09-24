"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";

interface WordBook {
  id: number;
  userId: number;
  title: string;
}

const formSchema = z.object({
  csvContent: z.string().min(1, "CSV内容を入力してください。"),
});

type FormData = z.infer<typeof formSchema>;

export default function ImportWordsContent({
  wordBook,
}: {
  wordBook: WordBook;
}) {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FormData) => {
    try {
      const res = await client.word.import.$post({
        json: {
          wordBookId: wordBook.id,
          csvContent: values.csvContent,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "単語のインポートに失敗しました。");
      }

      router.push(`/wordBooks/${wordBook.id}`);
      router.refresh();
    } catch (error: unknown) {
      console.error("単語のインポートエラー:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        「{wordBook.title}」に単語をインポート
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="csvContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CSV内容</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "インポート中..." : "インポート"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
