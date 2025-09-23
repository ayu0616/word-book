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
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { client } from "@/lib/hono";

const formSchema = z.object({
  term: z.string().min(1, { message: "単語を入力してください。" }).max(255),
  meaning: z.string().min(1, { message: "意味を入力してください。" }),
});

type WordFormValues = z.infer<typeof formSchema>;

export default function NewWordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">新しい単語を登録</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
