export class EmailAddress {
  private readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static create(email: string): EmailAddress {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new Error("Invalid email");
    }
    return new EmailAddress(trimmed);
  }
  toString() {
    return this.value;
  }
}

export class PasswordHash {
  private readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static fromHashed(hashed: string): PasswordHash {
    if (hashed.length < 20) throw new Error("Invalid password hash");
    return new PasswordHash(hashed);
  }
  toString() {
    return this.value;
  }
}
