"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { client } from "@/lib/hono";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await client.auth.signup.$post({
        json: { email, password, name: name || undefined },
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">新規登録</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            名前（任意）
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Taro"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "送信中..." : "登録"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        すでにアカウントをお持ちの方は{" "}
        <a href="/login" className="underline">
          ログイン
        </a>
      </p>
    </div>
  );
}
