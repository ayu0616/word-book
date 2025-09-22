import { beforeEach, describe, expect, it } from "vitest";
import type { AuthRepository, PasswordHasher } from "@/application/auth/ports";
import { AuthService } from "@/application/auth/service";
import { Session, User } from "@/domain/auth/entities";
import type { EmailAddress, PasswordHash } from "@/domain/auth/valueObjects";
import { BcryptPasswordHasher } from "@/infrastructure/auth/passwordHasher.bcrypt";

class InMemoryRepo implements AuthRepository {
  private users: User[] = [];
  private sessions: Session[] = [];

  async findUserByEmail(email: EmailAddress): Promise<User | null> {
    return (
      this.users.find((u) => u.email.toString() === email.toString()) ?? null
    );
  }
  async createUser(params: {
    email: EmailAddress;
    name?: string | null;
    passwordHash: PasswordHash;
  }): Promise<User> {
    const user = new User({
      id: this.users.length + 1,
      email: params.email,
      name: params.name ?? null,
      passwordHash: params.passwordHash,
      createdAt: new Date(),
    });
    this.users.push(user);
    return user;
  }
  async findUserById(id: number): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async createSession(params: {
    id: string;
    userId: number;
    expiresAt: Date;
  }): Promise<Session> {
    const s = new Session({
      id: params.id,
      userId: params.userId,
      expiresAt: params.expiresAt,
      createdAt: new Date(),
    });
    this.sessions.push(s);
    return s;
  }
  async findSessionById(id: string): Promise<Session | null> {
    return this.sessions.find((s) => s.id === id) ?? null;
  }
  async deleteSession(id: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.id !== id);
  }
}

describe("AuthService", () => {
  let repo: InMemoryRepo;
  let hasher: PasswordHasher;
  let service: AuthService;

  beforeEach(() => {
    repo = new InMemoryRepo();
    hasher = new BcryptPasswordHasher();
    service = new AuthService(repo, hasher, 3600_000);
  });

  it("signs up a new user and creates a session", async () => {
    const result = await service.signup({
      email: "user@example.com",
      password: "Password123!",
      name: "User",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.email).toBe("user@example.com");
      expect(result.sessionId).toBeTruthy();
    }
  });

  it("prevents duplicate signup by email", async () => {
    await service.signup({ email: "d@example.com", password: "Password123!" });
    const dup = await service.signup({
      email: "d@example.com",
      password: "Password123!",
    });
    expect(dup.ok).toBe(false);
  });

  it("logs in with correct password", async () => {
    await service.signup({
      email: "login@example.com",
      password: "Password123!",
    });
    const res = await service.login({
      email: "login@example.com",
      password: "Password123!",
    });
    expect(res.ok).toBe(true);
  });

  it("rejects invalid credentials", async () => {
    await service.signup({
      email: "bad@example.com",
      password: "Password123!",
    });
    const res = await service.login({
      email: "bad@example.com",
      password: "wrong",
    });
    expect(res.ok).toBe(false);
  });

  it("returns user in me() when session is valid", async () => {
    const su = await service.signup({
      email: "me@example.com",
      password: "Password123!",
    });
    if (!su.ok) throw new Error("signup failed in test");
    const me = await service.me(su.sessionId);
    expect(me.ok).toBe(true);
    if (me.ok) expect(me.user?.email).toBe("me@example.com");
  });

  it("returns null in me() when session missing", async () => {
    const me = await service.me(null);
    expect(me.ok).toBe(false);
    expect(me.user).toBeNull();
  });
});
