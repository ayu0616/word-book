"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { client } from "@/lib/hono";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await client.auth.login.$post({ json: { email, password } });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data && !data.ok ? data.error : "ログインに失敗しました");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (_err) {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">ログイン</h1>
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
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "送信中..." : "ログイン"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        アカウントをお持ちでない方は{" "}
        <a href="/signup" className="underline">
          新規登録
        </a>
      </p>
    </div>
  );
}
