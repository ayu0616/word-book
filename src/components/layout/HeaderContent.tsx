"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

interface User {
  id: number;
  email: string;
  name: string | null;
}

export default function HeaderContent({ user }: { user: User | null }) {
  const router = useRouter();

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
    <nav className="space-x-4">
      {user ? (
        <>
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
          <Button variant="ghost" className="text-white" onClick={handleLogout}>
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
  );
}
