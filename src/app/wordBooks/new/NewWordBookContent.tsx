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
import { Input } from "@/components/ui/input";
import { client } from "@/lib/hono";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(255),
});

type FormData = z.infer<typeof formSchema>;

export default function NewWordBookContent() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      const res = await client.wordBook.create.$post({ json: values });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error ?? "Failed to create word book.");
      }

      router.push(`/wordBooks/${data.wordBook.id}`);
    } catch (error) {
      console.error("Error creating word book:", error);
      // Optionally, display an error message to the user
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
          <Button type="submit">作成</Button>
        </form>
      </Form>
    </div>
  );
}
