import { createId } from "@paralleldrive/cuid2";
import { EmailAddress } from "@/domain/auth/valueObjects";
import type { AuthRepository, PasswordHasher } from "./ports";

export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessionTtlMs: number,
  ) {}

  async signup(input: {
    email: string;
    password: string;
    name?: string | null;
  }) {
    const email = EmailAddress.create(input.email);
    const exists = await this.repo.findUserByEmail(email);
    if (exists) {
      return { ok: false as const, error: "email_exists" };
    }
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.repo.createUser({
      email,
      name: input.name,
      passwordHash,
    });
    const sid = createId();
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);
    await this.repo.createSession({ id: sid, userId: user.id, expiresAt });
    return {
      ok: true as const,
      sessionId: sid,
      expiresAt,
      user: { id: user.id, email: email.toString(), name: user.name ?? null },
    };
  }

  async login(input: { email: string; password: string }) {
    const email = EmailAddress.create(input.email);
    const user = await this.repo.findUserByEmail(email);
    if (!user) return { ok: false as const, error: "invalid_credentials" };
    const valid = await this.hasher.verify(input.password, user.passwordHash);
    if (!valid) return { ok: false as const, error: "invalid_credentials" };
    const sid = createId();
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);
    await this.repo.createSession({ id: sid, userId: user.id, expiresAt });
    return {
      ok: true as const,
      sessionId: sid,
      expiresAt,
      user: { id: user.id, email: email.toString(), name: user.name ?? null },
    };
  }

  async logout(sessionId: string) {
    await this.repo.deleteSession(sessionId);
    return { ok: true as const };
  }

  async me(sessionId: string | null) {
    if (!sessionId) return { ok: false as const, user: null };
    const session = await this.repo.findSessionById(sessionId);
    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) await this.repo.deleteSession(session.id);
      return { ok: false as const, user: null };
    }
    const user = await this.repo.findUserById(session.userId);
    if (!user) return { ok: false as const, user: null };
    return {
      ok: true as const,
      user: {
        id: user.id,
        email: user.email.toString(),
        name: user.name ?? null,
      },
    };
  }
}
