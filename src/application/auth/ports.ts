import type { Session, User } from "@/domain/auth/entities";
import type { EmailAddress, PasswordHash } from "@/domain/auth/valueObjects";

export interface AuthRepository {
  findUserByEmail(email: EmailAddress): Promise<User | null>;
  createUser(params: {
    email: EmailAddress;
    name?: string | null;
    passwordHash: PasswordHash;
  }): Promise<User>;
  findUserById(id: number): Promise<User | null>;

  createSession(params: {
    id: string;
    userId: number;
    expiresAt: Date;
  }): Promise<Session>;
  findSessionById(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<PasswordHash>;
  verify(plain: string, hashed: PasswordHash): Promise<boolean>;
}
