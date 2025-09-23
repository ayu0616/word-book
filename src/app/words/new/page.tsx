import { cookies } from "next/headers";
import { AuthService } from "@/application/auth/service";
import { WordBookService } from "@/application/wordBook/service";
import { BcryptPasswordHasher } from "@/infrastructure/auth/passwordHasher.bcrypt";
import { DrizzleAuthRepository } from "@/infrastructure/auth/repository.drizzle";
import { DrizzleWordBookRepository } from "@/infrastructure/wordBook/repository.drizzle";
import { SESSION_COOKIE } from "@/lib/constants";
import NewWordContent from "./NewWordContent";

export default async function NewWordPage() {
  const authRepo = new DrizzleAuthRepository();
  const authHasher = new BcryptPasswordHasher();
  const authService = new AuthService(authRepo, authHasher, 0);

  const wordBookRepo = new DrizzleWordBookRepository();
  const wordBookService = new WordBookService(wordBookRepo);

  const sid = (await cookies()).get(SESSION_COOKIE)?.value;
  const me = await authService.me(sid || null);

  let wordBooks: { id: number; userId: number; title: string }[] = [];

  if (me.ok && me.user) {
    wordBooks = await wordBookService.findWordBooksByUserId(me.user.id);
  }

  return <NewWordContent wordBooks={wordBooks} />;
}
