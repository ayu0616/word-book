import { cookies } from "next/headers";
import { AuthService } from "@/application/auth/service";
import { WordBookService } from "@/application/wordBook/service";
import { BcryptPasswordHasher } from "@/infrastructure/auth/passwordHasher.bcrypt";
import { DrizzleAuthRepository } from "@/infrastructure/auth/repository.drizzle";
import { DrizzleWordBookRepository } from "@/infrastructure/wordBook/repository.drizzle";
import { SESSION_COOKIE } from "@/lib/constants";
import HomeContent from "./HomeContent";

export default async function HomePage() {
  const authRepo = new DrizzleAuthRepository();
  const authHasher = new BcryptPasswordHasher();
  const authService = new AuthService(authRepo, authHasher, 0);

  const wordBookRepo = new DrizzleWordBookRepository();
  const wordBookService = new WordBookService(wordBookRepo);

  const sid = (await cookies()).get(SESSION_COOKIE)?.value;
  const me = await authService.me(sid || null);

  let wordBooks: { id: number; userId: number; title: string }[] = [];
  let error: string | null = null;

  if (me.ok && me.user) {
    try {
      wordBooks = (await wordBookService.findWordBooksByUserId(me.user.id)).map(
        (wb) => Object.assign({}, wb),
      );
    } catch (_err) {
      error = "単語帳の取得に失敗しました";
    }
  } else {
    error = "認証されていません";
  }

  return <HomeContent wordBooks={wordBooks} error={error} />;
}
