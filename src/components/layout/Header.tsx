"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await client.auth.me.$get();
        const data = await res.json();
        if (data.ok) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (_err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await client.auth.logout.$post({});
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">単語帳アプリ</span>
        </Link>
        <nav className="space-x-4">
          {loading ? (
            <span>読み込み中...</span>
          ) : user ? (
            <>
              <span>ようこそ, {user.name || user.email}</span>
              <Link href="/wordBooks/new">
                <Button variant="ghost" className="text-white">
                  新しい単語帳
                </Button>
              </Link>
              <Link href="/words/new">
                <Button variant="ghost" className="text-white">
                  新しい単語
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-white"
                onClick={handleLogout}
              >
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white">
                  ログイン
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="ghost" className="text-white">
                  新規登録
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
