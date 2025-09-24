"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { client } from "@/lib/hono";

const formSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }).max(255),
});

type FormData = z.infer<typeof formSchema>;

export default function NewWordBookContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FormData) => {
    try {
      const res = await client.wordBook.create.$post({ json: values });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error ?? "単語帳の作成に失敗しました。");
      }

      router.push(`/wordBooks/${data.wordBook.id}`);
    } catch (error: unknown) {
      console.error("単語帳の作成エラー:", error);
      if (error instanceof Error) {
        setError(error.message ?? "ネットワークエラーが発生しました。");
      } else {
        setError("不明なエラーが発生しました。");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新しい単語帳を作成</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>単語帳タイトル</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            作成
          </Button>
        </form>
      </Form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
