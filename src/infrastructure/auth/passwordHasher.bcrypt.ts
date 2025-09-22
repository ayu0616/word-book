import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/application/auth/ports";
import { PasswordHash } from "@/domain/auth/valueObjects";

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12;

  async hash(plain: string) {
    const hashed = await bcrypt.hash(plain, this.saltRounds);
    return PasswordHash.fromHashed(hashed);
  }

  async verify(plain: string, hashed: PasswordHash) {
    return bcrypt.compare(plain, hashed.toString());
  }
}
