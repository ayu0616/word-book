import { eq } from "drizzle-orm";
import type { AuthRepository } from "@/application/auth/ports";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { Session, User } from "@/domain/auth/entities";
import { EmailAddress, PasswordHash } from "@/domain/auth/valueObjects";

export class DrizzleAuthRepository implements AuthRepository {
  async findUserByEmail(email: EmailAddress): Promise<User | null> {
    const row = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.email, email.toString()),
    });
    if (!row) return null;
    return new User({
      id: row.id,
      email,
      name: row.name ?? null,
      passwordHash: PasswordHash.fromHashed(row.passwordHash),
      createdAt: row.createdAt,
    });
  }

  async createUser(params: {
    email: EmailAddress;
    name?: string | null;
    passwordHash: PasswordHash;
  }): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({
        email: params.email.toString(),
        name: params.name ?? null,
        passwordHash: params.passwordHash.toString(),
      })
      .returning();
    return new User({
      id: row.id,
      email: params.email,
      name: row.name ?? null,
      passwordHash: PasswordHash.fromHashed(row.passwordHash),
      createdAt: row.createdAt,
    });
  }

  async findUserById(id: number): Promise<User | null> {
    const row = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    });
    if (!row) return null;
    return new User({
      id: row.id,
      email: EmailAddress.create(row.email),
      name: row.name ?? null,
      passwordHash: PasswordHash.fromHashed(row.passwordHash),
      createdAt: row.createdAt,
    });
  }

  async createSession(params: {
    id: string;
    userId: number;
    expiresAt: Date;
  }): Promise<Session> {
    const [row] = await db
      .insert(sessions)
      .values({
        id: params.id,
        userId: params.userId,
        expiresAt: params.expiresAt,
      })
      .returning();
    return new Session({
      id: row.id,
      userId: row.userId,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    });
  }

  async findSessionById(id: string): Promise<Session | null> {
    const row = await db.query.sessions.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    });
    if (!row) return null;
    return new Session({
      id: row.id,
      userId: row.userId,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    });
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }
}
