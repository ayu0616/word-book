import { cookies } from "next/headers";
import Link from "next/link";
import { AuthService } from "@/application/auth/service";
import { BcryptPasswordHasher } from "@/infrastructure/auth/passwordHasher.bcrypt";
import { DrizzleAuthRepository } from "@/infrastructure/auth/repository.drizzle";
import { SESSION_COOKIE } from "@/lib/constants";
import HeaderContent from "./HeaderContent";

export default async function Header() {
  const authRepo = new DrizzleAuthRepository();
  const authHasher = new BcryptPasswordHasher();
  const authService = new AuthService(authRepo, authHasher, 0);

  const sid = (await cookies()).get(SESSION_COOKIE)?.value;
  const me = await authService.me(sid || null);

  let user = null;
  if (me.ok && me.user) {
    user = me.user;
  }

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">単語帳アプリ</span>
        </Link>
        <HeaderContent user={user} />
      </div>
    </header>
  );
}
