import {
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
  vitest,
} from "vitest";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { Session, User } from "@/domain/auth/entities";
import { EmailAddress, PasswordHash } from "@/domain/auth/valueObjects";
import { DrizzleAuthRepository } from "./repository.drizzle";

vitest.mock("@/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn() as Mock,
      },
      sessions: {
        findFirst: vi.fn() as Mock,
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn() as Mock,
      })),
    })) as Mock,
    delete: vi.fn(() => ({
      where: vi.fn() as Mock,
    })) as Mock,
  },
}));

// Mock drizzle-orm functions
vitest.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({
    column,
    value,
    __isDrizzleEq: true,
  })) as Mock,
}));

// Mock value objects
vitest.mock("@/domain/auth/valueObjects", () => {
  class MockEmailAddress {
    constructor(public value: string) {}
    toString = () => this.value;
    equals = vi.fn(
      (other: MockEmailAddress) => other.toString() === this.value,
    );
    static create = vi.fn((value: string) => new MockEmailAddress(value));
  }

  class MockPasswordHash {
    constructor(public value: string) {}
    toString = () => this.value;
    equals = vi.fn(
      (other: MockPasswordHash) => other.toString() === this.value,
    );
    static create = vi.fn((value: string) => new MockPasswordHash(value));
    static fromHashed = vi.fn((value: string) => new MockPasswordHash(value));
  }

  return {
    EmailAddress: MockEmailAddress,
    PasswordHash: MockPasswordHash,
  };
});

describe("DrizzleAuthRepository", () => {
  let repository: DrizzleAuthRepository;

  beforeEach(() => {
    repository = new DrizzleAuthRepository();
    vi.clearAllMocks();
  });

  describe("findUserByEmail", () => {
    it("should return a User if found", async () => {
      const mockEmail = EmailAddress.create("test@example.com");
      const mockPasswordHash = PasswordHash.fromHashed("hashedpassword");
      const mockUserRow = {
        id: 1,
        email: mockEmail.toString(),
        name: "Test User",
        passwordHash: mockPasswordHash.toString(),
        createdAt: new Date(),
      };

      (db.query.users.findFirst as Mock).mockResolvedValue(mockUserRow);

      const user = await repository.findUserByEmail(mockEmail);

      expect(user).toBeInstanceOf(User);
      expect(user?.id).toBe(mockUserRow.id);
      expect(user?.email.toString()).toBe(mockEmail.toString());
      expect(user?.name).toBe(mockUserRow.name);
      expect(user?.passwordHash.toString()).toBe(mockPasswordHash.toString());
      expect(db.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
    });

    it("should return null if user not found", async () => {
      const mockEmail = EmailAddress.create("notfound@example.com");
      (db.query.users.findFirst as Mock).mockResolvedValue(null);

      const user = await repository.findUserByEmail(mockEmail);

      expect(user).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create and return a new User", async () => {
      const mockEmail = EmailAddress.create("new@example.com");
      const mockPasswordHash = PasswordHash.fromHashed("newhashedpassword");
      const mockNewUserRow = {
        id: 2,
        email: mockEmail.toString(),
        name: "New User",
        passwordHash: mockPasswordHash.toString(),
        createdAt: new Date(),
      };

      (db.insert as Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockNewUserRow]),
      });

      const user = await repository.createUser({
        email: mockEmail,
        name: "New User",
        passwordHash: mockPasswordHash,
      });

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(mockNewUserRow.id);
      expect(user.email.toString()).toBe(mockEmail.toString());
      expect(user.name).toBe(mockNewUserRow.name);
      expect(user.passwordHash.toString()).toBe(mockPasswordHash.toString());
      expect(db.insert).toHaveBeenCalledWith(users);
      expect((db.insert as Mock)().values).toHaveBeenCalledWith({
        email: mockEmail.toString(),
        name: "New User",
        passwordHash: mockPasswordHash.toString(),
      });
    });
  });

  describe("findUserById", () => {
    it("should return a User if found by ID", async () => {
      const mockEmail = EmailAddress.create("idtest@example.com");
      const mockPasswordHash = PasswordHash.fromHashed("hashedpassword");
      const mockUserRow = {
        id: 3,
        email: mockEmail.toString(),
        name: "ID User",
        passwordHash: mockPasswordHash.toString(),
        createdAt: new Date(),
      };

      (db.query.users.findFirst as Mock).mockResolvedValue(mockUserRow);

      const user = await repository.findUserById(3);

      expect(user).toBeInstanceOf(User);
      expect(user?.id).toBe(mockUserRow.id);
      expect(user?.email.toString()).toBe(mockEmail.toString());
      expect(user?.name).toBe(mockUserRow.name);
      expect(user?.passwordHash.toString()).toBe(mockPasswordHash.toString());
      expect(db.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
    });

    it("should return null if user not found by ID", async () => {
      (db.query.users.findFirst as Mock).mockResolvedValue(null);

      const user = await repository.findUserById(999);

      expect(user).toBeNull();
    });
  });

  describe("createSession", () => {
    it("should create and return a new Session", async () => {
      const mockSessionId = "session-123";
      const mockUserId = 1;
      const mockExpiresAt = new Date();
      const mockNewSessionRow = {
        id: mockSessionId,
        userId: mockUserId,
        expiresAt: mockExpiresAt,
        createdAt: new Date(),
      };

      (db.insert as Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockNewSessionRow]),
      });

      const session = await repository.createSession({
        id: mockSessionId,
        userId: mockUserId,
        expiresAt: mockExpiresAt,
      });

      expect(session).toBeInstanceOf(Session);
      expect(session.id).toBe(mockNewSessionRow.id);
      expect(session.userId).toBe(mockNewSessionRow.userId);
      expect(session.expiresAt).toBe(mockNewSessionRow.expiresAt);
      expect(db.insert).toHaveBeenCalledWith(sessions);
      expect((db.insert as Mock)().values).toHaveBeenCalledWith({
        id: mockSessionId,
        userId: mockUserId,
        expiresAt: mockExpiresAt,
      });
    });
  });

  describe("findSessionById", () => {
    it("should return a Session if found by ID", async () => {
      const mockSessionId = "session-456";
      const mockSessionRow = {
        id: mockSessionId,
        userId: 1,
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      (db.query.sessions.findFirst as Mock).mockResolvedValue(mockSessionRow);

      const session = await repository.findSessionById(mockSessionId);

      expect(session).toBeInstanceOf(Session);
      expect(session?.id).toBe(mockSessionRow.id);
      expect(session?.userId).toBe(mockSessionRow.userId);
      expect(session?.expiresAt).toBe(mockSessionRow.expiresAt);
      expect(db.query.sessions.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
    });

    it("should return null if session not found by ID", async () => {
      (db.query.sessions.findFirst as Mock).mockResolvedValue(null);

      const session = await repository.findSessionById("non-existent");

      expect(session).toBeNull();
    });
  });

  describe("deleteSession", () => {
    it("should delete the session", async () => {
      const mockSessionId = "session-789";
      const mockWhere = vi.fn();
      (db.delete as Mock).mockReturnValue({
        where: mockWhere,
      });

      await repository.deleteSession(mockSessionId);

      expect(db.delete).toHaveBeenCalledWith(sessions);
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockSessionId,
        }),
      );
    });
  });
});
