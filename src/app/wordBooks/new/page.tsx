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
import { client } from "@/lib/hono";

const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "単語帳のタイトルを入力してください。" })
    .max(255),
});

type WordBookFormValues = z.infer<typeof formSchema>;

export default function NewWordBookPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WordBookFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = async (values: WordBookFormValues) => {
    setError(null);
    try {
      const res = await client.wordBook.create.$post({ json: values });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "単語帳の作成に失敗しました");
        return;
      }
      router.push("/"); // Redirect to home or word book list page
      router.refresh();
    } catch (_err) {
      setError("ネットワークエラーが発生しました");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">新しい単語帳を作成</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="例: 私の単語帳" {...field} />
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
            {form.formState.isSubmitting ? "作成中..." : "作成"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
