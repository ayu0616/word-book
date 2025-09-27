"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { client } from "@/lib/hono";

// export const dynamic = "force-static";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await client.auth.logout.$post();
      if (!res.ok) {
        setError("ログアウトに失敗しました");
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
      <h1 className="mb-6 text-2xl font-semibold">ログアウト</h1>
      <button
        type="button"
        onClick={doLogout}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "処理中..." : "ログアウト"}
      </button>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
