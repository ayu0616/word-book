import { pgEnum, pgTable } from "drizzle-orm/pg-core";

export const learningResultEnum = pgEnum("learning_result_enum", [
  "correct",
  "incorrect",
]);

export const users = pgTable("users", (t) => ({
  id: t.serial("id").primaryKey(),
  email: t.varchar("email", { length: 255 }).notNull().unique(),
  name: t.varchar("name", { length: 255 }),
  passwordHash: t.varchar("password_hash", { length: 255 }).notNull(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
}));

export const wordBooks = pgTable("word_books", (t) => ({
  id: t.serial("id").primaryKey(),
  userId: t
    .serial("user_id")
    .references(() => users.id)
    .notNull(),
  title: t.varchar("title", { length: 255 }).notNull(),
}));

export const words = pgTable("words", (t) => ({
  id: t.char("id", { length: 24 }).primaryKey(),
  wordBookId: t
    .serial("word_book_id")
    .references(() => wordBooks.id)
    .notNull(),
  term: t.varchar("term", { length: 255 }).notNull(),
  meaning: t.text("meaning").notNull(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  consecutiveCorrectCount: t
    .integer("consecutive_correct_count")
    .default(0)
    .notNull(),
  nextReviewDate: t
    .timestamp("next_review_date", { mode: "date" })
    .defaultNow()
    .notNull(),
}));

export const sessions = pgTable("sessions", (t) => ({
  id: t.text("id").primaryKey(),
  userId: t.integer("user_id").notNull(),
  expiresAt: t.timestamp("expires_at").notNull(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
}));
