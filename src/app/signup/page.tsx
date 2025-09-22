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
  email: z.email({ message: "有効なメールアドレスを入力してください。" }),
  name: z
    .string()
    .min(1, { message: "名前は1文字以上で入力してください。" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください。" }),
});

type SignupFormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setError(null);
    try {
      const res = await client.auth.signup.$post({
        json: {
          email: values.email,
          password: values.password,
          name: values.name || undefined,
        },
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data && !data.ok ? data.error : "サインアップに失敗しました");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">新規登録</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前（任意）</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Taro"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
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
            {form.formState.isSubmitting ? "送信中..." : "登録"}
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm text-gray-600">
        すでにアカウントをお持ちの方は{" "}
        <a href="/login" className="underline">
          ログイン
        </a>
      </p>
    </div>
  );
}
