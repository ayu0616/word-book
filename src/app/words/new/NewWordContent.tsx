"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";

const formSchema = z.object({
  wordBookId: z
    .number({ message: "単語帳を選択してください。" })
    .min(1, { message: "単語帳を選択してください。" }),
  term: z.string().min(1, { message: "単語を入力してください。" }).max(255),
  meaning: z.string().min(1, { message: "意味を入力してください。" }),
});

type WordFormValues = z.infer<typeof formSchema>;

interface WordBook {
  id: number;
  userId: number;
  title: string;
}

export default function NewWordContent({
  wordBooks,
}: {
  wordBooks: WordBook[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wordBookId: undefined, // Set initial value to undefined
      term: "",
      meaning: "",
    },
  });

  const onSubmit = async (values: WordFormValues) => {
    setError(null);
    try {
      const res = await client.word.create.$post({ json: values });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "単語の登録に失敗しました");
        return;
      }
      router.push("/"); // Redirect to home or word list page
      router.refresh();
    } catch (_err) {
      setError("ネットワークエラーが発生しました");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 container">
      <h1 className="mb-6 text-2xl font-semibold">新しい単語を登録</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="wordBookId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>単語帳</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="単語帳を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wordBooks.length === 0 ? (
                      <SelectItem value="-" disabled>
                        単語帳がありません
                      </SelectItem>
                    ) : (
                      wordBooks.map((wordBook) => (
                        <SelectItem
                          key={wordBook.id}
                          value={String(wordBook.id)}
                        >
                          {wordBook.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>単語</FormLabel>
                <FormControl>
                  <Input placeholder="例: Apple" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meaning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>意味</FormLabel>
                <FormControl>
                  <Textarea placeholder="例: リンゴ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "登録中..." : "登録"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
