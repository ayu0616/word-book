import { describe, expect, it } from "vitest";
import { EmailAddress, PasswordHash } from "@/domain/auth/valueObjects";

describe("EmailAddress", () => {
  it("normalizes and validates", () => {
    const e = EmailAddress.create("  USER@Example.com ");
    expect(e.toString()).toBe("user@example.com");
  });
  it("throws on invalid email", () => {
    expect(() => EmailAddress.create("invalid")).toThrow();
  });
});

describe("PasswordHash", () => {
  it("wraps hashed values", () => {
    const ph = PasswordHash.fromHashed(
      "$2a$12$abcdefghijklmnopqrstuvwxyzABCDE",
    );
    expect(ph.toString()).toContain("$");
  });
});
