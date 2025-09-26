import bcrypt from "bcryptjs";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { describe, expect, it, vi } from "vitest";
import { cn, hashPassword, verifyPassword } from "./utils";

// Mock clsx and tailwind-merge
vi.mock("clsx", () => ({
  clsx: vi.fn((...args) => args.flat().filter(Boolean).join(" ")),
}));
vi.mock("tailwind-merge", () => ({
  twMerge: vi.fn((...args) => args.join(" ")),
}));

// Mock bcryptjs
vi.mock("bcryptjs", async (importOriginal) => {
  const mod = await importOriginal<typeof import("bcryptjs")>();
  return {
    ...mod,
    default: {
      hashSync: vi.fn((plain, salt) => `hashed_${plain}_${salt}`),
      compareSync: vi.fn((plain, stored) => stored === `hashed_${plain}_12`),
    },
  };
});

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn(
        "class1",
        true && "class2",
        false && "class3",
        "class4",
      );
      expect(clsx).toHaveBeenCalledWith(["class1", "class2", false, "class4"]);
      expect(twMerge).toHaveBeenCalledWith("class1 class2 class4");
      expect(result).toBe("class1 class2 class4");
    });
  });

  describe("hashPassword", () => {
    it("should hash the password using bcrypt", () => {
      const plainPassword = "mysecretpassword";
      const hashedPassword = hashPassword(plainPassword);
      expect(bcrypt.hashSync).toHaveBeenCalledWith(plainPassword, 12);
      expect(hashedPassword).toBe("hashed_mysecretpassword_12");
    });
  });

  describe("verifyPassword", () => {
    it("should return true for a correct password", () => {
      const plainPassword = "mysecretpassword";
      const storedHash = "hashed_mysecretpassword_12";
      const isValid = verifyPassword(plainPassword, storedHash);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        plainPassword,
        storedHash,
      );
      expect(isValid).toBe(true);
    });

    it("should return false for an incorrect password", () => {
      const plainPassword = "mysecretpassword";
      const storedHash = "hashed_wrongpassword_12";
      const isValid = verifyPassword(plainPassword, storedHash);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        plainPassword,
        storedHash,
      );
      expect(isValid).toBe(false);
    });
  });
});
